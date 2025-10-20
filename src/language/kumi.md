# Kumi Schema Language Reference

Kumi is a data-driven schema language for defining computations over arrays and structured data. It's fully compatible with Ruby and extends Ruby modules with schema capabilities.

## Basic Structure

Every Kumi schema has this structure:

```kumi
schema do
  input do
    # Define input fields here
  end

  # Define computations here

  value :output_name, computation_expression
end
```

## Input Definition

Define the shape of data your schema accepts:

```kumi
input do
  integer :x          # Single integer
  float :y            # Single floating-point number
  string :name        # Text field
  boolean :active     # True/false value

  array :items do     # Array of items
    integer :count    # Each item has a count field
    string :label     # Each item has a label field
  end

  hash :metadata do   # Structured object
    string :version
    integer :year
  end
end
```

## Variables and Computations

Use `let` to define intermediate values:

```kumi
let :sum, input.x + input.y
let :doubled, sum * 2
```

## Output Values

Use `value` to define the schema's outputs:

```kumi
value :result, doubled
value :is_positive, result > 0
```

## Keywords

### Schema Structure
- `schema` - Start a schema definition
- `input` - Define input fields
- `do` - Start a block
- `end` - End a block

### Computations
- `let` - Define an intermediate value
- `value` - Define an output value

### Data Types
- `integer` - Whole numbers
- `float` - Decimal numbers
- `string` - Text
- `boolean` - True/false
- `array` - Lists (can nest)
- `hash` - Objects with named fields (can nest)

## Built-in Functions

### Aggregation
- `fn(:sum, array)` - Sum all values
- `fn(:count, array)` - Count items
- `fn(:min, [value1, value2])` - Minimum value
- `fn(:max, [value1, value2])` - Maximum value

### Transformation
- `select(condition, true_value, false_value)` - Conditional selection
- `shift(array, offset)` - Shift array elements
- `shift(array, offset, axis_offset: n)` - Shift with axis

### Advanced
- `fn(:sum_if, values_array, condition_array)` - Conditional sum
- `fn(:clamp, value, min, max)` - Clamp value between bounds

## Operators

### Arithmetic
- `+`, `-`, `*`, `/`, `%` - Basic math

### Comparison
- `==`, `!=`, `<`, `>`, `<=`, `>=` - Comparisons

### Logical
- `&` - AND
- `|` - OR
- `!` - NOT

## Example: Game of Life

```kumi
schema do
  input do
    array :rows do
      array :col do
        integer :alive  # 0 or 1
      end
    end
  end

  let :a, input.rows.col.alive
  let :n, shift(a, -1, axis_offset: 1)
  let :neighbors, fn(:sum, [n, s, w, e, nw, ne, sw, se])
  let :next_alive, (neighbors == 3) | ((neighbors == 2) & (a > 0))

  value :next_state, select(next_alive, 1, 0)
end
```

## Common Patterns

### Conditional Output
```kumi
value :status, select(input.score > 50, "pass", "fail")
```

### Aggregation
```kumi
let :total, fn(:sum, input.amounts)
value :average, total / fn(:count, input.amounts)
```

### Nested Array Access
```kumi
let :first_item, input.items.first
let :all_counts, input.items.count
```

## Tips

- **Indexing**: Use `.first`, `.last`, or numeric indices on arrays
- **Nested Access**: Chain dot notation: `input.data.nested.field`
- **Conditions**: Use `select()` for if/then/else logic
- **Debugging**: Output intermediate `let` values to see computation steps
