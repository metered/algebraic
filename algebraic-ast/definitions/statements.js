const { is, data, nullable, array, or } = require("@algebraic/type");
const { boolean, number, string } = require("@algebraic/type/primitive");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { StringSet } = require("./string-set");
const FreeVariables = require("./string-set").in `freeVariables`;


exports.Label = Node `Label` (
    ({override:type})   =>  "Identifier",
    name                =>  string,
    ([freeVariables])   =>  FreeVariables.Never );

exports.BlockStatement = Node `BlockStatement` (
    body                =>  array (Node.Statement),
    ([freeVariables])   =>  FreeVariables.from("body") );

exports.BreakStatement = Node `BreakStatement` (
    label               =>  Node.Label,
    ([freeVariables])   =>  FreeVariables.Never );

exports.ContinueStatement = Node `ContinueStatement` (
    label               =>  Node.Label,
    ([freeVariables])   =>  FreeVariables.Never );

exports.DebuggerStatement = Node `DebuggerStatement` (
    ([freeVariables])   =>  FreeVariables.Never );

exports.DoWhileStatement = Node `DoWhileStatement` (
    block               =>  Node.BlockStatement,
    test                =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("block", "test") );

exports.EmptyStatement = Node `EmptyStatement` (
    ([freeVariables])   =>  FreeVariables.Never );

exports.ExpressionStatement = Node `ExpressionStatement` (
    expression          =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("expression") );

exports.FunctionDeclaration = Node `FunctionDeclaration` (
    // This can be null in the `export default function() { }` case.
    id                  =>  nullable(Node.IdentifierPattern),
    params              =>  array (Node.RootPattern),
    body                =>  Node.BlockStatement,

    generator           =>  [boolean, false],
    async               =>  [boolean, false],

    ([freeVariables])   =>  FreeVariables.from("id", "params", "body") )

exports.IfStatement = Node `IfStatement` (
    test                =>  Node.Expression,
    consequent          =>  Node.Statement,
    alternate           =>  nullable(Node.Statement),
    ([freeVariables])   =>  FreeVariables.from
                                ("test", "consequent", "alternate") );

exports.ForOfStatement = Node `ForOfStatement` (
    left                =>  or (Node.RootPattern, Node.VariableDeclaration),
    right               =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("left", "right", "body") );

exports.ForInStatement = Node `ForInStatement` (
    left                =>  or (Node.RootPattern, Node.VariableDeclaration),
    right               =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("left", "right", "body") );

exports.ForStatement = Node `ForStatement` (
    init                =>  nullable(or (Node.VariableDeclaration,
                                         Node.AssignmentExpression)),
    test                =>  nullable(Node.Expression),
    update              =>  nullable(Node.Expression),
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from
                                ("init", "test", "update", "body") );

exports.LabeledStatement = Node `LabeledStatement` (
    label               =>  Node.Label,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("body") );

exports.ReturnStatement = Node `ReturnStatement` (
    argument            =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.ThrowStatement = Node `ThrowStatement` (
    argument            =>  Node.Expression,
    ([freeVariables])   =>  FreeVariables.from("argument") );

exports.WhileStatement = Node `WhileStatement` (
    test                =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("test", "body") );

exports.WithStatement = Node `WithStatement` (
    object              =>  Node.Expression,
    body                =>  Node.Statement,
    ([freeVariables])   =>  FreeVariables.from("object", "body") );

exports.VariableDeclarator = Node `VariableDeclarator` (
    id                  => Node.RootPattern,
    init                => [nullable(Node.Expression), null],
    definite            => [nullable(boolean), null],

    ([bindingNames])    => [StringSet, id => (console.log(id.bindings),id.bindings)],
    ([freeVariables])   => [StringSet, (id, init) => init ?
                                init.freeVariables
                                    .concat(id.freeVariables)
                                    .subtract(id.bindings) :
                                id.freeVariables ]);

const fromDeclaratorBindingNames = declarators => declarators
    .reduce((bindingNames, declarator) =>
        bindingNames.concat(declarator.bindingNames), StringSet());

exports.VariableDeclaration = Node `VariableDeclaration` (
    declarators         =>  array (Node.VariableDeclarator),
    ([declarations])    =>  [array (Node.VariableDeclarator),
                                declarators => declarators],

    kind                =>  string,

    ([varBindings])     =>  [StringSet, (kind, declarators) =>
                                kind === "var" ?
                                    fromDeclaratorBindingNames(declarators) :
                                    StringSet()],
    ([blockBindings])   =>  [StringSet, (kind, declarators) =>
                                kind !== "var" ?
                                    fromDeclaratorBindingNames(declarators) :
                                    StringSet()],
    ([freeVariables])   =>  FreeVariables.from ("declarators") );







