import fs from 'fs';
import path from 'path';

// Load and prepare the function from App.vue
const appVuePath = path.resolve('src/App.vue');
const appVueContent = fs.readFileSync(appVuePath, 'utf-8');

// Extract formatJsonToHtml function
const funcMatch = appVueContent.match(/const formatJsonToHtml = \([\s\S]+?<\/script>/);
if (!funcMatch) {
  console.error("Could not find formatJsonToHtml function in App.vue");
  process.exit(1);
}

// Clean up function: extract code up to the end of the function
const functionCodeMatch = appVueContent.match(/(const formatJsonToHtml = \([\s\S]+?^};)/m);
if (!functionCodeMatch) {
  console.error("Could not extract function code body");
  process.exit(1);
}

let functionCode = functionCodeMatch[1];
// Strip TypeScript annotations to run in Node.js
// Replace (jsonObj: any): string => with (jsonObj) =>
functionCode = functionCode.replace(/\(jsonObj:\s*any\):\s*string\s*=>/, '(jsonObj) =>');

// Create the function using eval/Function
const formatJsonToHtml = eval(functionCode + '; formatJsonToHtml');

// Test cases definition
const tests = [
  {
    name: "Null and Undefined inputs",
    input: null,
    expected: ""
  },
  {
    name: "Undefined input",
    input: undefined,
    expected: ""
  },
  {
    name: "Empty Object",
    input: {},
    expected: '<span class="text-slate-400">{</span><span class="text-slate-400">}</span>'
  },
  {
    name: "Empty Array",
    input: [],
    expected: '<span class="text-slate-400">[</span><span class="text-slate-400">]</span>'
  },
  {
    name: "Nested Object",
    input: { a: { b: 1 } },
    expectedContains: [
      '<span class="text-sky-400 font-semibold">"a":</span>',
      '<span class="text-sky-400 font-semibold">"b":</span>',
      '<span class="text-amber-400 font-mono">1</span>'
    ]
  },
  {
    name: "String values containing colons",
    input: { url: "https://example.com" },
    expectedContains: [
      '<span class="text-sky-400 font-semibold">"url":</span>',
      '<span class="text-emerald-400">"https://example.com"</span>'
    ]
  },
  {
    name: "String value ending with colon",
    input: { key: "value:" },
    expectedContains: [
      '<span class="text-sky-400 font-semibold">"key":</span>',
      '<span class="text-emerald-400">"value:"</span>'
    ]
  },
  {
    name: "Boolean and Null properties",
    input: { boolTrue: true, boolFalse: false, nullVal: null },
    expectedContains: [
      '<span class="text-sky-400 font-semibold">"boolTrue":</span>',
      '<span class="text-amber-400 font-mono">true</span>',
      '<span class="text-sky-400 font-semibold">"boolFalse":</span>',
      '<span class="text-amber-400 font-mono">false</span>',
      '<span class="text-sky-400 font-semibold">"nullVal":</span>',
      '<span class="text-amber-400 font-mono">null</span>'
    ]
  },
  {
    name: "Integer and Float values",
    input: { int: 42, float: 3.14, negative: -5, exponent: 1e-5 },
    expectedContains: [
      '<span class="text-amber-400 font-mono">42</span>',
      '<span class="text-amber-400 font-mono">3.14</span>',
      '<span class="text-amber-400 font-mono">-5</span>',
      '<span class="text-amber-400 font-mono">0.00001</span>' // JSON.stringify(1e-5) is 0.00001 or 1e-5 depending on JS engine
    ]
  },
  {
    name: "HTML escaping inside string value",
    input: { html: "<script>alert(1)</script>" },
    expectedContains: [
      '<span class="text-emerald-400">"&lt;script&gt;alert(1)&lt;/script&gt;"</span>'
    ]
  },
  {
    name: "String values containing words like true, false, null, numbers",
    input: { text: "true false null 123" },
    expectedContains: [
      '<span class="text-emerald-400">"true false null 123"</span>'
    ]
  },
  {
    name: "String values containing escaped quotes",
    input: { escaped: 'value with "quote"' },
    expectedContains: [
      '<span class="text-emerald-400">"value with \\"quote\\""</span>'
    ]
  }
];

let failed = false;
console.log("=== Starting formatJsonToHtml Tokenizer Tests ===\n");

tests.forEach((t) => {
  try {
    const result = formatJsonToHtml(t.input);
    
    // Normalize string representation (JSON.stringify might serialize HTML entities/characters)
    // E.g. JSON.stringify encodes double quotes inside key/values as \" which gets escaped to &quot; if we format.
    // Let's verify expectations
    let pass = true;
    const reasons = [];

    if (t.expected !== undefined) {
      // Normalize whitespace for comparison
      const normResult = result.replace(/\s+/g, ' ').trim();
      const normExpected = t.expected.replace(/\s+/g, ' ').trim();
      if (normResult !== normExpected) {
        pass = false;
        reasons.push(`Expected: ${normExpected}\nGot:      ${normResult}`);
      }
    }

    if (t.expectedContains) {
      t.expectedContains.forEach((substring) => {
        // Since exponent format might differ, we can do dynamic check or soft check
        if (substring === '<span class="text-amber-400 font-mono">0.00001</span>') {
          const hasEither = result.includes('<span class="text-amber-400 font-mono">0.00001</span>') ||
                            result.includes('<span class="text-amber-400 font-mono">1e-5</span>');
          if (!hasEither) {
            pass = false;
            reasons.push(`Expected to contain: 0.00001 or 1e-5 with number class span, got: ${result}`);
          }
        } else if (!result.includes(substring)) {
          pass = false;
          reasons.push(`Expected to contain: ${substring}`);
        }
      });
    }

    if (pass) {
      console.log(`[PASS] ${t.name}`);
    } else {
      console.log(`[FAIL] ${t.name}`);
      console.log(`  Actual output:\n${result}`);
      reasons.forEach(r => console.log(`  - ${r}`));
      failed = true;
    }
  } catch (err) {
    console.log(`[FAIL] ${t.name} (threw error)`);
    console.error(err);
    failed = true;
  }
});

console.log("\n=== Test Run Finished ===");
if (failed) {
  process.exit(1);
} else {
  console.log("All tests passed successfully!");
  process.exit(0);
}
