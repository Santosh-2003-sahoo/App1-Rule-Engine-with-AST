function parseRuleString(ruleString) {
    const tokens = ruleString.match(/(\(|\)|AND|OR|<=|>=|!=|<|>|=|[^()\s]+)/g);
    const stack = [];
    const operators = [];

    function popOperator() {
        const operator = operators.pop();
        const right = stack.pop();
        const left = stack.pop();
        
        // console.log("****"+operator+left+right+"****");
        stack.push({ type: 'operator', operator, left, right });
    }

    for (let i = 0; i < tokens.length; i++) {
        // console.log(tokens[i]);
        const token = tokens[i].trim();
        if (token === ' ') continue; // Skip empty tokens (spaces)

        if (token === 'AND' || token === 'OR') {
            while (operators.length && operators[operators.length - 1] !== '(') {
                popOperator();
            }
            operators.push(token);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators.length && operators[operators.length - 1] !== '(') {
                popOperator();
            }
            operators.pop();
        } else {
            // const [key, operator, value] = token.split(/(<=|>=|<|>|=|!=|)/).map(s => s.trim());
            let key=null,operator=null,value=null;
            while(i<tokens.length && (key==null||operator==null||value==null) ){
              if(key===null) key=tokens[i];
              else if(operator==null) operator=tokens[i];
              else value=tokens[i];
              i++;
            }
            i--;
            // console.log("---"+key+operator+value+"---");
            stack.push({ type: 'operand', key, operator, value });
        }
    }

    while (operators.length) {
        popOperator();
    }

    return stack[0];
}

function printTree(node, prefix = "", isLeft = true) {
    if (!node) return;
    console.log(prefix + (isLeft ? "├── " : "└── ") + (node.type === 'operator' ? node.operator : `${node.key} ${node.operator} ${node.value}`));
    if (node.left) printTree(node.left, prefix + (isLeft ? "│   " : "    "), true);
    if (node.right) printTree(node.right, prefix + (isLeft ? "│   " : "    "), false);
}

function combineNodes(rules) {
    if (rules.length === 1) return rules[0];

    let combined = rules[0];
    for (let i = 1; i < rules.length; i++) {
        combined = { type: 'operator', operator: 'AND', left: combined, right: rules[i] };
    }

    return combined;
}

function evaluate(node, data) {
    if (node.type === 'operand') {
        switch (node.operator) {
            case '>': return data[node.key] > parseFloat(node.value);
            case '<': return data[node.key] < parseFloat(node.value);
            case '>=': return data[node.key] >= parseFloat(node.value);
            case '<=': return data[node.key] <= parseFloat(node.value);
            case '=': return data[node.key] == node.value;
            case '!=': return data[node.key] != node.value;
            default: throw new Error(`Unknown operator ${node.operator}`);
        }
    } else if (node.type === 'operator') {
        const left = evaluate(node.left, data);
        const right = evaluate(node.right, data);
        switch (node.operator) {
            case 'AND': return left && right;
            case 'OR': return left || right;
            default: throw new Error(`Unknown operator ${node.operator}`);
        }
    }
}

module.exports = { parseRuleString, combineNodes, evaluate, printTree };    
