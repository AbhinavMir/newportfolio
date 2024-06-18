---
title: Cheatsheet on Network and Communication Protocols
description: A comprehensive cheatsheet on network and communication protocols, including TCP/IP, HTTP, DNS, and more.
date: "2023-03-08"
---

- **Routing**
  - **Destination**: The final endpoint where the packet needs to be delivered.
  - **Next hop**: The immediate next router or node to which the packet should be forwarded.
  - **Cost**: The metric used to determine the best path to the destination, such as hop count, latency, or bandwidth.
  - **CIDR** (Classless Inter-Domain Routing): A method for allocating IP addresses and routing that specifies an IP address and its associated network mask (e.g., `192.168.1.0/24`).

- **BGP (Border Gateway Protocol)**
  - **From the perspective of the mentioned node**: Create a table showing how each part of the network can be reached, including details like the path attributes and next hop for each destination.
  - **Table Example**:
    | Destination | Next Hop    | Path        | AS Path |
    |-------------|-------------|-------------|---------|
    | 10.0.0.0/8  | 192.168.1.1 | 192.168.1.1 | 65001   |
    | 172.16.0.0/12 | 192.168.2.1 | 192.168.2.1 | 65002   |

- **DV (Distance Vector) Routing of WAN**
  - **Routing congestion**:
    $$
    \text{Routing congestion} = (\text{totalLinks} - 1)(\text{duplex})(\text{number of switches})(\text{bit storage number})
    $$
  - **Explanation**: Calculates the congestion based on the number of links, whether the links are duplex, the number of switches, and the bit storage number.

- **Next Hop Routing**
  - **For P, Q, R**:
    - Consider routing to *all* destinations.
    - Take the shortest route from the source to the destination.
    - Add the cost between the source and the lowest cost next neighbor.

- **Split Horizon**
  - Prevents a router from sending routing information about a route back in the direction from which it came, thus avoiding routing loops.

- **Route Poisoning**
  - Uses distance vector routing to send an infinite metric (e.g., 16) about a link that is down, indicating that the route is no longer reachable.

- **Route Convergence**
  - The process of a network topology adjusting to changes in routing information, such as a link failure or a new route being advertised, to reach a state where all routers have a consistent view of the network.

- **BGP Convergence**
  - BGP does not guarantee convergence because it lacks control mechanisms to determine route convergence. It relies on neighboring routers to update their local routing tables, leading to potential inconsistencies in network views.

- **DHCP (Dynamic Host Configuration Protocol) Messages**
  - **Discover**: The client broadcasts a message to locate available DHCP servers.
  - **Offer**: A DHCP server responds with an offer, including an available IP address.
  - **Request**: The client requests the offered IP address from the DHCP server.
  - **Ack**: The DHCP server acknowledges the request and assigns the IP address to the client.

- **Full-Duplex Communication**
  - In full-duplex mode, data transmission occurs simultaneously in both directions. Do not add time for ACK; it piggybacks on a returning data packet.

- **Congestion Control**
  - **Slow Start**: The sender starts with a small congestion window (sending small packets) and increases it exponentially until it reaches a threshold.

- **Subnetting**
  - **Example Subnet Mask `255.255.255.0`**:
    - IP range: 192.168.1.0 - 192.168.1.255.
    - Usable addresses: $256 - 3 = 253$ (reserved addresses: .0 (network address), .1 (default gateway), and .255 (broadcast address)).
  - **Binary Conversion**:
    - Convert each octet to binary using powers of 2.
    - Example: `192.168.1.0` to binary: `11000000.10101000.00000001.00000000`.
  - **CIDR to Subnet Mask**:
    - Turn the IP to binary.
    - Count from 0 to the CIDR number (`/number`).
    - Keep those bits as 1, rest as 0. This forms the subnet mask.
  - **Quick Hack**:
    - To reserve `N` bits: CIDR number is $32 - N$.

- **Data Link Layer**
  - **Sublayers**:
    - **Logical Link Control (LLC)**:
      - Interface between the network layer and the MAC sublayer.
      - Functions: Error control, frame sequencing, and flow control.
    - **Media Access Control (MAC)**:
      - Controls access to the communication media.
      - Implements medium access control protocols.

- **ARP (Address Resolution Protocol)**
  - Resolves IP addresses to MAC addresses, allowing for proper packet delivery on a local network.

- **Bandwidth Delay Product**
  - Formula: 
    $$
    \text{Bandwidth Delay product} = \text{bandwidth} \times \text{delay (or RTT)}
    $$
  - Represents the amount of data that can be in transit in the network.

- **Sequence Number Bits Calculation**
  - Number of bits needed to represent the sequence number:
    $$
    \log_2(\text{SWS} + \text{RWS})
    $$
  - Protocols:
    - **Stop-and-Wait (S&W)**: SWS = RWS = 1
    - **Go-Back-N (GBN)**: RWS = 1
    - **Selective Repeat (SR)**: SWS = RWS
      - SR provides the highest amount of control, while SW provides the lowest.