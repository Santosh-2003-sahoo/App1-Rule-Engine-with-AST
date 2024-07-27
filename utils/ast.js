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

function printTree(node,prefix = '', isLeft = true) {
    if (!node) return;
    console.log(prefix + (isLeft ? "├── " : "└── ") + (node.type === 'operator' ? node.operator : `${node.key} ${node.operator} ${node.value}`));
    if (node.left) printTree(node.left, prefix + (isLeft ? "│   " : "    "), true);
    if (node.right) printTree(node.right, prefix + (isLeft ? "│   " : "    "), false);
}

function combineNodes(rules,op) {
    if (rules.length === 1) return rules[0];

    let combined = rules[0];
    for (let i = 1; i < rules.length; i++) {
        combined = { type: 'operator', operator: op, left: combined, right: rules[i] };
    }

    return combined;
}

function evaluate(node, data) {
    if (node.type === 'operator') {
      const left = evaluate(node.left, data);
      const right = evaluate(node.right, data);
      if (node.operator === 'AND') {
        return left && right;
      } else if (node.operator === 'OR') {
        return left || right;
      }
    } else if (node.type === 'operand') {
      let { key, operator, value } = node;
      if (typeof value === 'string'){
        if (value[0] === "'" && value[value.length - 1] === "'") {
          value = value.slice(1, value.length - 1);
        }
      }
    // console.log(value, data[key]);
      switch (operator) {
        case '>':
          return data[key] > value;
        case '<':
          return data[key] < value;
        case '>=':
          return data[key] >= value;
        case '<=':
          return data[key] <= value;
        case '==':
          return data[key] == value;
        case '!=':
          return data[key] != value;
        case '=': // assuming '=' is the same as '=='
          return data[key] == value;
        default:
          return false;
      }
    }
    return false;
  }
  
module.exports = { parseRuleString, combineNodes, evaluate, printTree };    
