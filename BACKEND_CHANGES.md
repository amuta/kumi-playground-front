# Backend API Changes for Web-v2

## Current State (Audit Results)

### Endpoint: `POST /api/kumi/compile`

**Current Response:**
```json
{
  "ok": true,
  "schema_hash": "abc123...",
  "artifact_url": "http://localhost:3000/api/kumi/artifacts/abc123.js",
  "artifact_hash": "sha256...",
  "js_src": "export class KumiCompiledModule { ... }",
  "ruby_src": "module Kumi::Compiled::... end"
}
```

**Files:**
- Service: `/web/app/services/kumi_compile.rb`
- Controller: `/web/app/controllers/api/kumi_compile_controller.rb`

### Analyzer State Keys Available

The analyzer already provides:
- ✅ `state[:input_form_schema]` - from `InputFormSchemaPass`
- ✅ `state[:output_schema]` - from `OutputSchemaPass`
- ✅ `state[:lir_module]` - LIR (Low-level IR)
- ✅ `state[:javascript_codegen_files]["codegen.js"]`
- ✅ `state[:ruby_codegen_files]["codegen.rb"]`
- ✅ `state[:schema_digest]`

## Required Changes

### 1. Update `KumiCompile` Service

**File:** `/web/app/services/kumi_compile.rb`

**Changes:**
```ruby
class KumiCompile
  def self.call(src)
    begin
      ast,_ = Kumi::Frontends::Text.load(src:)
      res = Kumi::Analyzer.analyze!(ast, side_tables: true)

      js_src = res.state[:javascript_codegen_files]["codegen.js"]
      ruby_src = res.state[:ruby_codegen_files]&.dig("codegen.rb")
      schema_digest = res.state[:schema_digest]

      # NEW: Extract schemas
      input_form_schema = res.state[:input_form_schema]
      output_schema = res.state[:output_schema]

      # NEW: Extract LIR (optional - for display only)
      lir_text = format_lir(res.state[:lir_module]) if res.state[:lir_module]

      {
        ok: true,
        js_src: js_src,
        ruby_src: ruby_src,
        schema_digest: schema_digest,
        input_form_schema: input_form_schema,
        output_schema: output_schema,
        lir: lir_text
      }
    rescue => e
      Rails.logger.error "Kumi compilation failed: #{e.class} - #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}"
      { ok: false, errors: [e.message] }
    end
  end

  private

  def self.format_lir(lir_module)
    # Convert LIR AST to readable string format
    # This might already exist in Kumi - check for a printer/formatter
    return nil unless lir_module
    lir_module.inspect # Placeholder - improve with proper formatter
  end
end
```

### 2. Update Controller Response

**File:** `/web/app/controllers/api/kumi_compile_controller.rb`

**Changes:**
```ruby
render json: {
  ok: true,
  schema_hash: schema_digest,
  artifact_url: artifact_url(schema_digest),
  artifact_hash: Digest::SHA256.hexdigest(js),
  js_src: js,
  ruby_src: result[:ruby_src],
  lir: result[:lir],                              # NEW
  input_form_schema: result[:input_form_schema],  # NEW
  output_schema: result[:output_schema]           # NEW
}
```

## New Response Format

```json
{
  "ok": true,
  "schema_hash": "abc123...",
  "artifact_url": "http://localhost:3000/api/kumi/artifacts/abc123.js",
  "artifact_hash": "sha256...",

  "js_src": "export class KumiCompiledModule { ... }",
  "ruby_src": "module Kumi::Compiled::... end",
  "lir": "...",

  "input_form_schema": {
    "x": { "type": "integer" },
    "items": {
      "type": "array",
      "element": {
        "type": "object",
        "fields": {
          "price": { "type": "float" },
          "quantity": { "type": "integer" }
        }
      }
    }
  },

  "output_schema": {
    "total": {
      "kind": "value",
      "type": "float",
      "axes": []
    },
    "expensive": {
      "kind": "trait",
      "type": "boolean",
      "axes": ["items"]
    }
  }
}
```

## Testing Strategy

### 1. Unit Tests

Update `/web/spec/services/kumi_compile_spec.rb`:

```ruby
RSpec.describe KumiCompile do
  it "includes input_form_schema" do
    src = "schema do\n  input do\n    integer :x\n  end\n  value :doubled, input.x * 2\nend"
    result = KumiCompile.call(src)

    expect(result[:ok]).to be true
    expect(result[:input_form_schema]).to include("x" => { "type" => "integer" })
  end

  it "includes output_schema" do
    src = "schema do\n  input do\n    integer :x\n  end\n  value :doubled, input.x * 2\nend"
    result = KumiCompile.call(src)

    expect(result[:ok]).to be true
    expect(result[:output_schema]).to include("doubled")
    expect(result[:output_schema]["doubled"]["kind"]).to eq("value")
  end
end
```

### 2. Integration Tests

Update `/web/spec/requests/api/kumi_compile_spec.rb`:

```ruby
RSpec.describe "POST /api/kumi/compile" do
  it "returns input_form_schema and output_schema" do
    post "/api/kumi/compile", params: { schema_src: valid_schema }

    json = JSON.parse(response.body)
    expect(json["input_form_schema"]).to be_present
    expect(json["output_schema"]).to be_present
  end
end
```

### 3. Manual Testing

```bash
cd /home/muta/repos/kumi-play/web

# Start server
rails s

# Test endpoint
curl -X POST http://localhost:3000/api/kumi/compile \
  -H "Content-Type: application/json" \
  -d '{"schema_src":"schema do\n  input do\n    integer :x\n  end\n  value :doubled, input.x * 2\nend"}'
```

## LIR Formatting (Optional Enhancement)

If there's a pretty-printer for LIR in Kumi, use it:

```ruby
# Check in /home/muta/repos/kumi/lib for:
# - Kumi::LIR::Printer
# - Kumi::LIR::Formatter
# - Or similar

def self.format_lir(lir_module)
  return nil unless lir_module
  Kumi::LIR::Printer.print(lir_module) # Example - check actual API
end
```

## Backwards Compatibility

✅ **Fully backwards compatible** - only adding new fields to response
- Existing clients ignore unknown fields
- No breaking changes to existing keys

## Next Steps

1. ✅ Audit complete
2. [ ] Update `KumiCompile` service
3. [ ] Update controller
4. [ ] Run existing tests to ensure no regressions
5. [ ] Add new tests for schemas
6. [ ] Manual testing with curl
7. [ ] Update web-v2 API client to consume new fields

## Timeline

Estimated: **30 minutes** for implementation + testing
