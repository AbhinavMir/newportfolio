---
title: Writing a lexer for C in Ocaml
description: Writing a lexer for C in Ocaml
date: "2024-05-17"
---

$x$
ref. [Nora Sandler's, Writing a C Compiler, Part 1](https://norasandler.com/2017/11/29/Write-a-Compiler.html)

This is my first time using Ocaml, and Dune. If this is the case with you, if you want a primer, you can read the official docs, and then do `99 Problems` and get back here, although 3 problems in, I said "Bah! I got this" and infact, I didn't. You can read this bit, and implement parsers in the next one on your own.

First, I'd say install Ocaml and Dune and start a new project with Dune, and let's move forward directly with writing a new lexing function in `lexer.ml` that can parse `int main() { return 42; }`.

Second, we want to define what the tokens are. For such a simple program, there are only a handful of tokens we need. Some may call this process "scanning", as does Robert Nystrom [here](https://craftinginterpreters.com/scanning.html), but what it does is take a program, and break it into chunks without worrying about the syntax. For our program, we just need `int, return, {}, (), int, indentation`, roughly.

```ocaml
type token =
  | Int
  | Return
  | LBrace
  | RBrace
  | LParen
  | RParen
  | Number of int
  | Ident of string
```

This might look odd, but is a perfect starting point to Ocaml's weird, quirky style.

The `|` symbol is used in Ocaml to denote various cases a variable can take up. In C, an equivalent program can be

```C
typedef enum {
    Int,
    Return,
    LBrace,
    RBrace,
    LParen,
    RParen,
    Number,
    Ident
} TokenType;

typedef struct {
    TokenType type;
    union {
        int intValue;
        char* strValue;
    } value;
} Token;
```

Moving on, `Int, Return, LBrace, RBrace, LParen, RParen` are simple constructors. They represent a specific kind of token but don't carry any additional data.
`Number of int` and `Ident of string` are constructors with associated data. A token of kind Number carries with it an integer, and a token of kind Ident carries with it a string.

Next, let us define a function named `lex` and function `aux` that takes in a variable named `pos` which we'll use to track where we are inside our argument variable.

```ocaml
let lex str =
  let rec aux pos =
```

We want to make sure that if the position is greater than the length of the input program, we return `[]` from the auxiallry function `aux` that we're using kind of like a faux-indexer.

```ocaml
if pos >= String.length str then []
else
```

Now we want to find a way to containerize the current string into a token. `int` and `i n t` are 1 and 3 tokens, the idea is using the whitespace characters. 

```ocaml
match str.[pos] with | ' ' | '\n' | '\t' | '\r' -> aux (pos + 1)
```

This checks (using the Ocaml's switch-like `|` we discussed earlier) if the current string is a whitespace, if yes, then it calls `aux` recursively with the next position `pos+1` as the parameter.

But what happens when the current string is a non-whitespace character? We do the same thing, but we find a way to equate the character to a type we defined earlier.

```ocaml
| '{' -> LBrace :: aux (pos + 1)
| '}' -> RBrace :: aux (pos + 1)
| '(' -> LParen :: aux (pos + 1)
| ')' -> RParen :: aux (pos + 1)
```

Let's worry about numbers now.

```ocaml
    | '0'..'9' as c ->
          let rec number n p =
            if p < String.length str && Char.code str.[p] >= Char.code '0' && Char.code str.[p] <= Char.code '9'
            then number (n * 10 + (Char.code str.[p] - Char.code '0')) (p + 1)
            else (Number n, p)
          in
          let (num, newPos) = number (Char.code c - Char.code '0') (pos + 1) in
          num :: aux newPos
      | _ ->
```

You already know what the first line does. From then on, we define a function `number` that is recursive, and takes in two parameters: `n`, to keep track of the current accumulated number and `p` as in position from before. Quickly asserting a few things in the next line: position is not out of bounds, and the number being read is greater than 0, less than 9 (pays to be careful!).

If the conditions are met, it recursively calls itself, updating `n` to include the digit at position `p` (by converting the character to its numeric value and adding it to `n` multiplied by `10`, effectively shifting `n` one decimal place left).

This process continues until a non-digit character is encountered, at which point the function returns a tuple `(Number n, p)`, where Number `n` is the token representing the accumulated number and `p` is the position of the first non-digit character after the number.

Finally, this number needs to be converted to an actual integer to make sense. 

There are a few ways you could do this, but keeping this language agnostic, we'll use ASCII-aritmetic (not an actual thing, before you Google). That's what the `number (n * 10 + (Char.code str.[p] - Char.code '0')) (p + 1)` represents - it shows us calling the function `number` recrusively, so if we were to be lex-ing `12` as our number, it would look like this.
- Encounter '1': Start with `n = 1` and `pos` pointing to '2'.
- Encounter '2': Update `n` to `n * 10 + 2 = 12`, increment `pos`.
- No more digits: Return `(Number 12, newPos)`, where `newPos` is the position after '2'.

The final few things we need to worry about are characters (Aa through Zz), and a few chosen keywords/identifiers. We have to be skimpy, or we'd have a huge corpus to identify. A good way to do this is building "up" frrom our target and including things along the way. [The syntax of C in Backus-Naur Form](https://cs.wmich.edu/~gupta/teaching/cs4850/sumII06/The%20syntax%20of%20C%20in%20Backus-Naur%20form.htm) by Dr. Ajay Gupta is a good place to start. How would we write a BNF equivalent for our expression earlier?

```
<declaration-specifier> ::= int
<declarator> ::= <direct-declarator>
<direct-declarator> ::= main ( )
<compound-statement> ::= { <statement> }
<statement> ::= <jump-statement>
<jump-statement> ::= return <expression> ;
<expression> ::= <constant>
<constant> ::= 2
```

A parser will use something like BNF to understand the structure and syntax of the code, we have given it a form of understanding braces and numbers, let's give it an ability to understand characters.

```ocaml
| _ ->
let rec ident n p = if p < String.length str && (Char.code str.[p] >= Char.code 'a' && Char.code str.[p] <= Char.code 'z' || Char.code str.[p] >= Char.code 'A' && Char.code str.[p] <= Char.code 'Z') then ident (n ^ String.make 1 str.[p]) (p + 1) else (n, p) in
```

Since ASCII is sequential, `Char.code` makes it easy for us to check if we are in the A-Z bounds (upper case and lower case). We do the same thing as we did earlier, recurisively call `ident` (for identifier) and push the current character (via `^` concat operation in OCaml) into current accumulation of characters by making a single character string frrom the character with `String.make 1 str.[p]`.

Finally, we need a way to make sure `int` and `return` keywords stand out, because they're each other's jack-and-jill. So now we call:

```ocaml
let (id, newPos) = ident (String.make 1 str.[pos]) (pos + 1) in (match id with
| "int" -> Int
| "return" -> Return
| _ -> Ident id) :: aux newPos
```

1. `ident (String.make 1 str.[pos]) (pos + 1)` initializes the identifier parsing with the first character and starts from the next position.
2. The `ident` function processes characters until it forms a complete identifier, returning the identifier (`id`) and the new position in the string (`newPos`).
3. The `match` statement checks the value of `id`:
   - If `id` is `"int"`, it produces the `Int` token.
   - If `id` is `"return"`, it produces the `Return` token.
   - For any other value, it produces an `Ident id` token, encapsulating the identifier.
4. The resulting token is prepended to the list of tokens generated by recursively calling `aux newPos`, which continues parsing from `newPos`.

Now tying up the ponytail, add in `in aux 0`

The `in aux 0` at the end of the `lex` function initiates the lexical analysis process by calling the `aux` helper function with `0` as the starting position. This starts the tokenization of the string `str` from the beginning.

And now you can run it, like [this]().