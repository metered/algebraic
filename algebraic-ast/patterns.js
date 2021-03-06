const { is, data, or, boolean, string, type, array } = require("@algebraic/type");
const union2 = require("@algebraic/type/union-new");
const Node = require("./node");
const { KeyPathsByName } = require("./key-path");


exports.RootPattern = union2 `RootPattern` (
    is                  =>  Node.IdentifierPattern,
    or                  =>  Node.ArrayPattern,
    or                  =>  Node.ObjectPattern );

// In order to maintain backwards compatibility with ESTree's spec, we set
// the type property to "Identifier". This makes this portion of the tree
// appear unchanged to Babel and other ESTree compatible tools.
exports.IdentifierPattern = Node `IdentifierPattern` (
    ([ESTreeType])      =>  data.always ("Identifier"),

    name                =>  string,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `name`),
    ([freeVariables])   =>  data.always (KeyPathsByName.None) );

exports.RestElement = Node `RestElement` (
    argument            =>  Node.RootPattern,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `argument.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `argument.freeVariables`) );

exports.AssignmentPattern = Node `AssignmentPattern` (
    left                =>  Node.RootPattern,
    right               =>  Node.Expression,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `left.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ) );

exports.ArrayPattern = Node `ArrayPattern` (
    elements            =>  array (or (Node.RootPattern, Node.AssignmentPattern)),
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `elements.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `elements.freeVariables`) );

exports.ShorthandAssignmentPattern = Node `ShorthandAssignmentPattern` (
    ([ESTreeType])      =>  data.always ("AssignmentPattern"),

    left                =>  Node.IdentifierPattern,
    right               =>  Node.Expression,
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `left.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables` ));

exports.ObjectPropertyPatternShorthand = Node `ObjectPropertyPatternShorthand` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (true),
    ([computed])        =>  data.always (false),

    ([key])             =>  [Node.PropertyName, value =>
                                is (Node.IdentifierPattern, value) ?
                                    Node.PropertyName(value) :
                                    Node.PropertyName(value.left)],
    value               =>  or (Node.IdentifierPattern,
                                Node.ShorthandAssignmentPattern ),

    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `value.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `value.freeVariables`) );

exports.ObjectPropertyPatternLonghand = Node `ObjectPropertyPatternLonghand` (
    ([ESTreeType])      =>  data.always ("ObjectProperty"),

    ([shorthand])       =>  data.always (false),
    ([computed])        =>  [boolean, key =>
                                is(Node.ComputedPropertyName, key)],

    key                 =>  or (Node.ComputedPropertyName,
                                Node.PropertyName,
                                Node.StringLiteral),
    value               =>  or (Node.RootPattern,
                                Node.AssignmentPattern),

    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `value.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `left.freeVariables`,
                                take => `right.freeVariables`) );

exports.ObjectPropertyPattern = union2 `ObjectPropertyPattern` (
    is                  => Node.ObjectPropertyPatternLonghand,
    or                  => Node.ObjectPropertyPatternShorthand );

exports.ObjectPattern = Node `ObjectPattern` (
    properties          =>  array (Node.ObjectPropertyPattern ),
    ([bindingNames])    =>  KeyPathsByName.compute (
                                take => `properties.bindingNames`),
    ([freeVariables])   =>  KeyPathsByName.compute (
                                take => `properties.freeVariables`) );

