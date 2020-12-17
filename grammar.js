const PREC = {
  CALL: 1,
  ALIAS: 2
};

module.exports = grammar({
  name: "angular",
  rules: {
    program: $ => repeat($._definition),
    _definition: $ => choice(
      $.structural_declaration,
      $._any_expression,
      $.assignment_expression),
    _any_expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.expression),
    expression: $ => seq(
      $._primitive,
      optional(field("pipes", $.pipe_sequence))),
    group: $ => seq("(", $._any_expression, ")"),
    _primitive: $ => choice($.object, $.array, $.identifier, $.string, $.number, $.call_expression, $.group, $.member_expression),
    object: $ => seq(
      "{",
      repeat($.pair),
      "}"),
    array: $ => seq(
      "[",
      repeat(choice($.expression, $.unary_expression)),
      "]"),
    pair: $ => seq(
      field("key", choice($.identifier, $.string)),
      ":",
      field("value", choice($.expression, $.unary_expression))),
    pipe_sequence: $ => repeat1(seq("|", $.pipe_call)),
    pipe_call: $ => seq(field("name", $.identifier), optional(field("arguments", $.pipe_arguments))),
    pipe_arguments: $ => repeat1($._pipe_argument),
    member_expression: $ => seq(
      field("object", $._primitive),
      choice(".", "?.", "!."),
      field("property", $.identifier)),
    arguments: $ => seq(
      choice(
        $._primitive,
        $.binary_expression,
        $.unary_expression),
      repeat(
        seq(",", $._primitive))),
    _pipe_argument: $ => seq(":", $._primitive),
    _single_quote: $ => "'",
    _double_quote: $ => "\"",
    _binary_op: $ => choice(
      "+",
      "-",
      "/",
      "*",
      "%",
      "==",
      "===",
      "!=",
      "!==",
      "&&",
      "||",
      "<",
      "<=",
      ">",
      ">="),
    assignment_expression: $ => seq(
      field("name", $.identifier),
      "=",
      field("value", $._any_expression)),
    unary_operator: $ => choice("!"),
    number: $ => /[0-9]+\.?[0-9]*/,
    unary_expression: $ => seq(
      field("operator", $.unary_operator),
      field("value", $.expression)),
    binary_expression: $ => seq(
      field("left", $._primitive),
      field("operator", $._binary_op),
      field("right", $._primitive)),
    string: $ => choice(
      seq($._double_quote, repeat(token.immediate(/[^"]/)), $._double_quote),
      seq($._single_quote, repeat(token.immediate(/[^']/)), $._single_quote)),
    call_expression: $ => prec.left(PREC.CALL, seq(
      field("function", $.identifier),
      "(",
      optional(field("arguments", $.arguments)),
      ")")),
    identifier: $ => /[a-zA-Z_0-9\-\$]+/,
    _alias: $ => seq('as', field('alias', $.identifier)),
    structural_assignment: $ => choice(
      seq(
        field("name", $.identifier),
        ":",
        field("value", $.identifier)),
      prec.left(
        PREC.ALIAS,
        seq(
          field("name", $.identifier),
          field("operator", $.identifier),
          field("value", $.expression),
          optional($._alias))),
      seq(
        field("name", $.identifier),
          optional($._alias))),
    structural_declaration: $ => seq(
      "let",
      seq(
        $.structural_assignment,
        repeat(seq(choice(";", ","), $.structural_assignment))))
  }
});
