require "yaml"
require "pathname"

yaml_files = Dir.glob(".github/**/*.{yml,yaml}", File::FNM_DOTMATCH)
  .map { |item| Pathname(item) }
  .select(&:file?)
  .sort

sha40 = /\A[0-9a-fA-F]{40}\z/
sha256 = /\A[0-9a-fA-F]{64}\z/
violations = []

validate_uses = lambda do |raw, path, trail|
  unless raw.is_a?(String)
    violations << "#{path}:#{trail}: uses must be a string"
    next
  end

  ref = raw.strip
  if ref.start_with?("./")
    clean = Pathname(ref).cleanpath.to_s.sub(%r{\A\./}, "")
    parts = clean.split("/")
    unless parts.length == 3 && parts[0, 2] == [".github", "actions"] &&
           parts[2].match?(/\A[A-Za-z0-9][A-Za-z0-9._-]*\z/)
      violations << "#{path}:#{trail}: local actions are restricted to .github/actions/: #{ref}"
      next
    end
    local = Pathname(clean)
    actions_root = Pathname(".github/actions")
    if actions_root.symlink? || local.symlink?
      violations << "#{path}:#{trail}: symlinked local Action is forbidden: #{ref}"
    elsif !local.directory? || !(local.join("action.yml").file? || local.join("action.yaml").file?)
      violations << "#{path}:#{trail}: local action metadata not found: #{ref}"
    end
    next
  end

  if ref.start_with?("docker://")
    digest = ref.split("@sha256:", 2)[1]
    unless digest && digest.match?(sha256)
      violations << "#{path}:#{trail}: Docker action must use an @sha256 digest: #{ref}"
    end
    next
  end

  separator = ref.rindex("@")
  owner_action = separator ? ref[0...separator] : nil
  version = separator ? ref[(separator + 1)..] : nil
  unless owner_action && !owner_action.empty? && version&.match?(sha40)
    violations << "#{path}:#{trail}: external action ref must be a 40-hex commit SHA: #{ref}"
  end
end

walk = lambda do |node, path, trail, segments|
  case node
  when Hash
    node.each do |key, value|
      key_s = key.to_s
      child = trail.empty? ? key_s : "#{trail}.#{key_s}"
      location = segments + [key_s]
      workflow = path.to_s.start_with?(".github/workflows/")
      metadata = path.to_s.start_with?(".github/actions/")
      job_node = location.length == 3 && location[0] == "jobs"
      step_node = location.length == 5 && location[0] == "jobs" &&
                  location[2] == "steps" && location[3].is_a?(Integer)
      action_step = location.length == 4 && location[0] == "runs" &&
                    location[1] == "steps" && location[2].is_a?(Integer)

      if workflow && segments.empty? && ["on", "true"].include?(key_s)
        events = case value
                 when String then [value]
                 when Array then value
                 when Hash then value.keys
                 else []
                 end
        if events.any? { |event| event.to_s.strip == "pull_request_target" }
          violations << "#{path}:#{child}: pull_request_target is forbidden"
        end
      end
      if workflow && (segments.empty? || job_node) && key_s == "permissions"
        if value.is_a?(String) && value.strip == "write-all"
          violations << "#{path}:#{child}: permissions: write-all is forbidden"
        elsif value.is_a?(Hash) && value.any? { |_scope, permission| permission.to_s.start_with?("write") }
          violations << "#{path}:#{child}: write permissions are forbidden for this read-only CI"
        end
      end
      if key_s == "uses" && ((workflow && (job_node || step_node)) ||
                            (metadata && action_step))
        validate_uses.call(value, path, child)
      end
      walk.call(value, path, child, location)
    end
  when Array
    node.each_with_index do |value, index|
      walk.call(value, path, "#{trail}[#{index}]", segments + [index])
    end
  end
end

fixtures = {
  "forbidden scalar event" => ["on: pull_request_target", true],
  "forbidden list event" => ["on: [push, pull_request_target]", true],
  "forbidden map event" => ["on: {push: {}, pull_request_target: {}}", true],
  "allowed list events" => ["on: [pull_request, push]", false],
  "quoted write-all" => ["permissions: 'write-all'", true],
  "mutable flow-style action" => ["jobs: {bad: {steps: [{uses: owner/action@v4}]}}", true],
  "ordinary uses input" => [
    "jobs: {safe: {steps: [{uses: 'actions/checkout@11d5960a326750d5838078e36cf38b85af677262', with: {uses: 'regular input'}}]}}",
    false
  ],
  "hidden local action" => ["jobs: {bad: {steps: [{uses: './.github/actions/.hidden'}]}}", true]
}

fixtures.each do |label, (yaml, should_fail)|
  violations.clear
  parsed = YAML.safe_load(yaml, permitted_classes: [], permitted_symbols: [], aliases: true)
  walk.call(parsed, Pathname(".github/workflows/_policy_fixture.yml"), "", [])
  raise "Pipeline integrity self-test failed: #{label}" unless violations.any? == should_fail
end
puts "Pipeline integrity policy self-tests passed: #{fixtures.length} cases."

yaml_files.each do |path|
  if path.size > 524_288
    violations << "#{path}: YAML exceeds the 512 KiB policy limit"
    next
  end

  begin
    document = YAML.safe_load(
      path.read,
      permitted_classes: [],
      permitted_symbols: [],
      aliases: true
    )
  rescue Psych::Exception => error
    violations << "#{path}: YAML parse failed: #{error.message.lines.first.to_s.strip}"
    next
  end

  walk.call(document, path, "", [])
end

if violations.any?
  warn violations.join("\n")
  exit 1
end

puts "Pipeline integrity OK: semantically scanned #{yaml_files.length} GitHub YAML files."
