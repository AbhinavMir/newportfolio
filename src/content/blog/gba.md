---
title: The architecture of GameBoy
description: A dive into z80 and LR35902, the CPU of GameBoy
date: 2023-07-01
---

I don’t like consumerism. One of my favorite Scholars, Bertrand Russell, once said

> “It is preoccupation with possessions, more than anything else, that prevents us from living freely and nobly."
> 

But you can bet I have a soft spot in my heart for Nintendo products. Pokemon on Game Boy Advance was one the only games I have ever truly enjoyed before being dragged by the dark, drab realities of life. I’d love to have a shelf with Pokemon merch, but I digress.

Now that we are done with that segment, let’s get started by looking at the beautiful, beautiful Game Boy Classic!

The Game Boy is as old as me, and it has more processing power than me. It has an 8-bit processor called the SHARP LR35902, which is a “hybrid” between Intel 8080 and Zilog Z80. Z80 is considered an enhancement of the 8080. Z80 had an enhanced instruction set that had single-bit addressing, shifts/rotates on memory and registers other than accumulator. You had program looping, program counter relative jumps, block I/O and byte search instructions. Z80 also had new IX and IY index registers and a better interrupt system. SHARP LR3590 had a little bit of both.

- 8080’s registers are used (Single Register file)
- Z80’s Coding Syntax and Instruction Extender was used.
- However, neither IX, IY nor 8080’s I/O scheme were used. SHARP used a completely memory scheme, so these were not needed.
- Like 8080, a 8-bit data bus and 16-bit address were used, where a memory of 64 KB of Memory could be addressed.
- The memory map had: Cartridge ROM, WRAM, Display RAM, I/O and interrupt enabler.

We had a clock speed of about 4.2 MHz, which is achieved by a Crystal Oscillator. All of this worked on 3V DC, 0.6W supply.

![https://dev-to-uploads.s3.amazonaws.com/i/ow7di4xzp038t0qsqnl2.png](https://dev-to-uploads.s3.amazonaws.com/i/ow7di4xzp038t0qsqnl2.png)

*(That’s CPU + Power Processing Unit + Audio Processing Unit)*

Gameboy’s 8-bit CPU is called DMG CPU, equipped with 6 registers of 16 bit each: AF, BC, DE, HL, SP and PC. Here’s what they mean -

- AF: AF are two 8-bit registers, A and F. A is the Accumulator (arithmetic operations usually take place here)

![https://dev-to-uploads.s3.amazonaws.com/i/laxzpvjr3djtgc2w3wvv.jpg](https://dev-to-uploads.s3.amazonaws.com/i/laxzpvjr3djtgc2w3wvv.jpg)

*If you dial back to your Microcontrollers class, this is the Von Neumann Architecture and there is the accumulator* F is the Flag Register, it’s a special purpose register where each of the 8-bit have different purposes.

![https://dev-to-uploads.s3.amazonaws.com/i/ouj0pccxsl71hxl6cyi5.png](https://dev-to-uploads.s3.amazonaws.com/i/ouj0pccxsl71hxl6cyi5.png)

```
- Zero Flag (Z):

```

This bit is set when the result of a math operation is zero or two values match when using the CP (call If Positive) instruction. - Subtract Flag (N): This bit is set if a subtraction was performed in the last math instruction. - Half Carry Flag (H): This bit is set if a carry occurred from the lower nibble in the last math operation. - Carry Flag (C): This bit is set if a carry occurred from the last math operation or if register A is the smaller value when executing the CP instruction.

- BC, HL, DE are General Purpose Registers. They’re used for 16-bit operations such as temporary storage, copy during execution of the program. Mostly memory stuff.
- PC is the program counter, which points to the next instruction in the memory. The CPU uses PC to fetch the next operation that needs to be executed.
- SP is the Stack Pointer, which points to the current stack position in the memory. This can get a little hairy, grab your closest notebook if it gets overwhelming. With a fair bit of Googling, if you’ve followed the article thus far, I’m sure you know what a Stack is.  The stack in GameBoy usually keeps the variables and return addresses. It is also used to pass arguments to subroutines. So, to push information to the stack you would use PUSH, CALL and RST instructions. POP, RET and RETI are used to take information off the stack. The GameBoy stack pointer (SP) is used to keep track of the top of Stack. Remember, the Stack is a first-in, first-out data structure, so the top of the Stack will be the most recent data.
    
    ![https://dev-to-uploads.s3.amazonaws.com/i/r6ipzpqc6pbsecljzb4o.jpg](https://dev-to-uploads.s3.amazonaws.com/i/r6ipzpqc6pbsecljzb4o.jpg)
    

Now in GameBoy, execution starts at location 0, which is where GameBoy’s boot ROM is located. You’ll find the first instruction for the cartridges at the location `0000000100000000` , and we’ll talk more about this in a minute.

A typical way to fetch the instruction from memory would look like this charming little self-explanatory pseudocode.

`1. variable program_Counter = 0x0100 
2. variable operation = fetch_Operation(PC)
3. switch(operation){ case no_Operation{break}; case operation{operation; break;}

//The fetch_Operation would be
define operation{return memory[program_Counter++]`

Now, remember, Z80 and GB’s CPU use syntactically similar languages, so when we look at some real GB codes, don’t be too surprised to discover that Z80 and LR35902 have similar looking codes. For example, the instruction extender is same in both (opcode 0xcb).

 An important note on commands

Alright, now that these commands have been fetched, we need to execute these commands. There are 8-bit load commands and 16-bit load commands. They do the work of loading things from place A to place B (eg. loading the content of a register to a stack). Finally, there are 8-bit Arithmetical and Logical Operations (eg. increment a value stored in register). In the DMG CPU, there’s not a lot of 16-bit arithmetical operations to start with, and they just operate on the 16-bit registers. There’s also shifting and rotation (shifting but the bits wrap around the edges) commands (eg. `00010000` -> `00100000`).

There are a few couple other control operations as well: *HALT* (Halt until interrupt), *NOP* (Don’t do anything), Enable/Disable Interrupts. Then you’ve got Jump operations, using which you can jump to any location in the memory.

 Let’s talk about memory

Data is a bit obscure to the CPU. All this hullabaloo of wires we deal with in real world is irrelevant to the CPU. It is a processing unit, it gets data and it processes it. CPUs process all data, some correctly, some wrongly, but it is a heartless, agnostic machine, that takes in data, churns out data.

Address Bus is that good friend of the CPU that delivers it just that: Data. Address Bus are Read/Write lines that are used to transfer data.

Address Bus is also everyone else’s friend! The peripherals and cartridge are all on the address bus! Let’s dig a little bit deeper now.

 Memory and Memory-Mapped I/O

Memory Mapped I/Os (MMIO) tend to share the memory space with the external memory. MMIO are just methods of connecting the CPU and the peripheries.

![https://dev-to-uploads.s3.amazonaws.com/i/c7tfejeq04zp4xul27ex.png](https://dev-to-uploads.s3.amazonaws.com/i/c7tfejeq04zp4xul27ex.png)

What you see above is the general memory map of GameBoy, that I took from here. They write in depth about GameBoy and I’ve used their article among others (linked below) to research for this article, shout out!

We will be looking specifically at ROM and Switchable ROM bank, which are the first two regions of the memory.

  `0000-3FFF   16KB ROM Bank 00     (in cartridge, fixed at bank 00)
  4000-7FFF   16KB ROM Bank 01..NN (in cartridge, switchable bank number)
  8000-9FFF   8KB Video RAM (VRAM) (switchable bank 0-1 in CGB Mode)
  A000-BFFF   8KB External RAM     (in cartridge, switchable bank, if any)
  C000-CFFF   4KB Work RAM Bank 0 (WRAM)
  D000-DFFF   4KB Work RAM Bank 1 (WRAM)  (switchable bank 1-7 in CGB Mode)
  E000-FDFF   Same as C000-DDFF (ECHO)    (typically not used)
  FE00-FE9F   Sprite Attribute Table (OAM)
  FEA0-FEFF   Not Usable
  FF00-FF7F   I/O Ports
  FF80-FFFE   High RAM (HRAM)
  FFFF        Interrupt Enable Register`

The memory you see at 0100-014F is the internal information area. It has the Nintendo Logo, from here the entry point is established, the boot procedure then jumps to the main cartridge program. Now there are other metadata codes and flags that we will skip right now.

Now that’s all about the CPU of the GameBoy. I dug a little into how cartridges work, but nothing too much in depth. One day when I understand the cartridge system, I’ll be back here!

To read more about display in GameBoy, refer to Rodrigo’s blogs [here](https://www.copetti.org/projects/consoles/game-boy/). A lot of the research for the article, was done by reading Raphael’s GameBoy building Series, which you can read [here](https://medium.com/@raphaelstaebler/building-a-gameboy-from-scratch-part-1-51d05496783e). Of course, with this I leave you with my other two favorite resources, [Game Boy CPU Manual](http://marc.rawer.de/Gameboy/Docs/GBCPUman.pdf) and Pan Doc’s [Everything You Always Wanted To Know About GameBoy](http://bgb.bircd.org/pandocs.htm#aboutthepandocs).

---

If you enjoyed reading the article, show some love with those funky like buttons. Let me know where could I improve, or if you have any questions. I’ll be doing more such “Under the Hood” articles inspired by Rodrigo, so stick around!

Mir, signing off.

*Credits for images*: 

[1] [http://meseec.ce.rit.edu/551-projects/spring2014/4-1.pdf](http://meseec.ce.rit.edu/551-projects/spring2014/4-1.pdf) 

[2] [https://www.quora.com/What-is-an-accumulator-in-computer-science](https://www.quora.com/What-is-an-accumulator-in-computer-science) 

[3] GameBoy CPU Manual 

[4] FreeCode Camp on Stacks 

[5] Raphael’s Building GameBoy article

 I recently did a video on Nintendo Switch too!