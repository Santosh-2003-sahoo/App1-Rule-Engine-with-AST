const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ruleSchema = new Schema({
  ruleName: { type: String, required: true, unique: true },
  ruleAST: { type: Object, required: true }
});

const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule;
