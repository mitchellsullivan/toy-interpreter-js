// Interpreter

let symbols = {};
let stack = [];

const runScript = (script) => {
    // Clear stack but maintain symbols
    stack = [];
    symbols = { ...symbols, ...script }

    // Initialize
    stack.push({ name: "init", line: 0, args: {} });

    loopy:
    while (stack.length > 0) {
        // Peek stack
        const frame = stack[stack.length - 1];
        // Get lines in function
        const funcLength = symbols[frame.name].length;

        // Iterate lines
        while (frame.line < funcLength) {
            // Execute line
            const execLine = symbols[frame.name][frame.line];
            ++frame.line;

            // Stay in current frame and evaluate args
            const evaldArgs = {};

            // Evaluate parameters and pass by value
            Object.keys(execLine).forEach((k) => {
                const val = execLine[k];
                if (k === 'cmd') {
                    return;
                }
                else if (String(val).startsWith('#')) {
                    const [, varName] = val.split('#');
                    evaldArgs[k] = symbols[varName];
                }
                else if (String(val).startsWith('$')) {
                    const [, varName] = val.split('$');
                    evaldArgs[k] = frame.args[varName];
                }
                else {
                    evaldArgs[k] = val;
                }
            });

            switch (execLine.cmd) {
                case "print": {
                    console.log(evaldArgs.value);
                    break;
                }
                case "create": {
                    symbols[evaldArgs.id] = evaldArgs.value;
                    break;
                }
                case "update": {
                    symbols[evaldArgs.id] = evaldArgs.value;
                    break;
                }
                case "delete": {
                    delete symbols[evaldArgs.id];
                    break;
                }
                case "add": {
                    symbols[evaldArgs.id] = evaldArgs.operand1 + evaldArgs.operand2;
                    break;
                }
                case "subtract": {
                    symbols[evaldArgs.id] = evaldArgs.operand1 - evaldArgs.operand2;
                    break;
                }
                case "multiply": {
                    symbols[evaldArgs.id] = evaldArgs.operand1 * evaldArgs.operand2;
                    break;
                }
                case "divide": {
                    symbols[evaldArgs.id] = evaldArgs.operand1 / evaldArgs.operand2;
                    break;
                }
                default: {
                    // Jump out of current frame and call new func
                    if (execLine.cmd.startsWith('#')) {
                        const [, name] = execLine.cmd.split('#');
                        const next = {
                            name,
                            line: 0,
                            args: { ...evaldArgs }
                        };

                        stack.push(next)
                        continue loopy;
                    }

                    break;
                }
            }
        }

        // Remove from stack
        if (frame.line === funcLength) {
            stack.pop();
        }
    }
}

module.exports = {
  runScript,
}