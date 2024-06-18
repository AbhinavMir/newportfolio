---
title: Primer to Network Security
date: 2024-07-01
description: A cheatsheet.
---

### How to solve popular Cryptography questions

**Perfect secrecy**

- Calculate the probability of both the schemes giving the same output for the same mesage for different values of $k$ from the group. 
- If the message space is shorter than the generator space, it cannot be perfectly secret.

**Example of CPA secure system that’s not CCA secure**

Consider this scheme: $𝐸𝑛𝑐_𝑘 (𝑚) = 〈𝑟, 𝐹_𝑘(𝑟) ⊕ 𝑚〉, 𝑤ℎ𝑒𝑟𝑒 \space |𝑚| = 𝑛, 𝑟 ← 𝑈_𝑛, F_𝑘 \text{ 𝑖𝑠 𝑎 𝑃𝑅𝐹}$

Adversary sends $m_0 = 0^n$ and $m_1 = 1^n$ to the encryption oracle.

He gets back $Enc_k(m_b) = \langle r, F_k(r) \oplus m_b \rangle$, where $b \leftarrow {0, 1}$.

- $Enc_k(m_0) = \langle r_0, F_k(r_0) \rangle$, 50% of the time.
- $Enc_k(m_1) = \langle r_1, F_k(r_1) \rangle$, 50% of the time.

Since the decryption oracle will not accept the encryption of the challenge messages ($m_0$ or $m_1$) as input, the attacker will do the next best thing. They can flip the first bit in the encryption of $m_b$.

The decryption oracle will gladly decrypt the new ciphertext $\langle r, c \oplus 10^{n-1} \rangle$.

The adversary can now tell from what he gets back (either $0^{n-1}1$ or $1^{n-1}0$) whether $m_0 = 0^n$ or $m_1 = 1^n$ was encrypted.

**Constructing CCA-secure encryption schemes** (Common approach: CPA-ENC + EU-MAC)

Most CCA attacks rely on attacker modifying encryption of the `m` and then feeding it to the decryption oracle, whose answer tells the attacker which message was encrypted. If you add a MAC on top of the encryption, disallowing the attacker to fiddle with the ciphertext, then you essentially render the decryption oracle useless.

Let 𝜋 = (𝐸𝑛𝑐, 𝐷𝑒𝑐, 𝐺𝑒𝑛). The generator now has to generate two keys, one for the MAC and one for the encryption scheme. 
$$
\\Gen(msgSize) = (key_{enc}, key_{mac})
\\Enc(key_{enc}, key_{mac}, msg) = (c, msg_{tag})
\\Dec(key_{enc}, key_{mac}, c, tag) = p
$$
**Message Authentication Codes**

1. For $m=m1||m2$ and $\sigma =F_k(m1)||F_k(m2)$, the tag $\sigma =F_k(m2)||F_k(m1)$ is equally valid, so it is not a secure MAC.

2. Suppose the following scheme exists. Is it secure?

$m = m_1||m_2,  m_1, m_2 ∈ {0, 1}^n−1, \text{use the tag }F_k(0||m_1)||F_k(1||m_2)$

No, because an attacker can slice the tag from two different messages and then use it to reproduce messages for other values of $m$ that are from the messages they send initially.

Remember, that you shouldn’t be able to produce a MAC on any message without the key. Imagine you can ask for a MAC on any message m that you want and I’ll give it to you. Your goal is to try and produce a MAC that is correct on a message for which you never asked for a MAC. For example, you could ask for MACs on m1, m2, m3, . . . , m . You win if you can produce a MAC on some fresh message m, that isnt in the set $m_1, m_2, m_3, . . . , m_n$.

**Signatures**

These are public key versions of MAC. 

Suppose the following scheme exists:

$Gen’ : Compute (sk_1, pk_1) ← Gen(1^n )$

$Sign’(m=m_1||m_2, sk=sk_1||sk_2)$: Compute $\sigma_1 \larr Sign(m_1,sk_2), \sigma_2 \larr Sign(m_2, sk_2), output \space\sigma=\sigma_1||\sigma_2 $

(Split the message in half. Use the first secret key to sign the first half of the message and the second secret key to sign the second half of the message. The signature is just the concatenation of these two sub-signatures)

$Vrfy’ (m = m1||m2, σ, pk = pk1||pk2)$: Compute $b1 = Vrfy(σ1, pk1), b2 = Vrfy(σ2, pk2)$. Output $b1 ∧ b2$.

(Verify a signature by splitting the signature in half and the messsage in half and verifying each half on its own. If both verification algorithms output 1, output 1.)

UF-CMA: Secure in that you cannot produce a verifying signature on a message without the secret key, even if you get to see lots of other signatures.

Show that (Gen’ , Sign’ , Vrfy’ ) is not a UF-CMA secure digital signature scheme.

Answer: Not secure and this is why - Attacker knows the digital signature scheme, they know a signature request will output a string of length $n$, which is a concatenation of two strings Signature functions. They can get a bunch of signatures back, and then piece together a signature for a function that was never intended to be signed. 

**Key exchange**

Suppose Alice chooses $a_1, a_2\epsilon\{0,1\}^n$ (meaning two random bitstrings of length $n$) and sends a=$a_1\space XOR \space a_2$ to Bob. Bob randomly chooses b1, b2, and sends b = b1 xor b2 to Alice. Alice computes c=b xor a1, and sends it to Bob. Alice outputs a1 and bob outputs c xor b. Do they get the same key? Is this secure?

Answer: Alice outputs a1, Bob outputs *b*⊕*c*=*b*⊕*b*⊕*a*1, since *b*⊕*b*=0. Now since attacker knows a,b,c, they can also recalculate to a1.

**Man in the middle**

Diffie-Hellman key exchange

- Alice and Bob agree on a prime number p and a base g. 
- Alice chooses a secret number a, and sends Bob ( g^a mod p). 
- Bob chooses a secret number b, and sends Alice ( g^b mod p). 
- Alice computes (( g^b mod p )^a mod p). 
- Bob computes (( g^a mod p )^b mod p).
- Both Alice and Bob can use this number as their key. Notice that p and g need not be protected.

Now suppose the following scenario: The client chooses a random exponent a and sends g^a to the server. The server chooses a random exponent b and sends g^b to the client. Both client and server compute the key k = g^ab, each by raising the message they received to the private exponent they chose. The client sends Enc_k(m) to the server who can decrypt it since it has the key k.

(a) What, if anything, can be learned by an eavesdropper who may not tamper with messages?

The attacker can either use leaked metadata to do malicious activity (such as email patterns and such) but learns nothing about the content itself.

(b) How can an attacker hijack and attack this scheme?

- The attacker intercepts the communication between the client and the server.
- The attacker chooses a value 'n' and sends the server 'g^n'.
- The attacker intercepts the communication from the server.
- The attacker chooses a value 'm' and sends the client 'g^m'.
- The client calculates 'k = g^(ma)' using the received value 'g^m'.
- The server calculates 'k0 = g^(nb)' using the received value 'g^n'.
- The attacker can decrypt the server's data using the key 'g^(ma)', which allows them to read the data in plaintext.
- The attacker can encrypt the data under the key 'g^(nb)' and send it to the server.
- The attacker can read the data, but send it to the server using their own encrypting/decrypting key.
- The attacker can also send messages pretending to be the client or server, as they have intercepted the communication and can manipulate the keys and data.

### ARP and BGP

ARP (Address Resolution Protocol) and BGP (Border Gateway Protocol) are two fundamental protocols used in computer networks, but they serve different purposes. Let's dive into each protocol individually:

1. Address Resolution Protocol (ARP):
ARP is used in local area networks (LANs) to map an IP address to a physical MAC (Media Access Control) address. It allows devices within the same network to communicate with each other using MAC addresses. Here's how ARP works:

- When a device wants to send data to another device within the same network, it checks if it has the MAC address of the destination device in its ARP cache. If the MAC address is not present, it sends an ARP request to the network asking, "Who has this IP address?"
- All devices in the network receive the ARP request, but only the device with the matching IP address responds by sending an ARP reply with its MAC address.
- The requesting device receives the ARP reply, updates its ARP cache with the MAC address, and then sends the data packet to the destination device using the MAC address.

In summary, ARP helps in resolving IP addresses to MAC addresses within a local network, enabling devices to communicate with each other.

2. Border Gateway Protocol (BGP):
BGP is an exterior gateway protocol used in wide area networks (WANs) to facilitate routing between different autonomous systems (ASes). ASes are individual networks or groups of networks under a single administrative domain. BGP's primary purpose is to exchange routing information and make decisions on how to route traffic across the internet. Here's an overview of how BGP works:

- BGP routers form peer connections with other BGP routers in neighboring autonomous systems. These connections are established using TCP/IP.
- Once the peer connections are established, BGP routers exchange routing information in the form of network reachability information (known as prefixes). This information includes the IP prefixes that each AS can reach and the associated path attributes.
- BGP routers apply various path attributes (such as AS path length, origin, and local preferences) to determine the best path for forwarding traffic to a particular destination network.
- BGP routers update their routing tables based on the received information and the path selection process. They then propagate the updated routing information to their neighboring routers.
- BGP routers continuously monitor the reachability and performance of the advertised routes. If a route becomes unavailable or less desirable, routers withdraw or update the routing information accordingly.

BGP is essential for maintaining a reliable and efficient routing system on the internet. It enables autonomous systems to communicate and exchange routing information, allowing packets to traverse multiple networks to reach their destinations.

In summary, ARP is responsible for resolving IP addresses to MAC addresses within a local network, while BGP is used for interconnecting different autonomous systems and exchanging routing information on a global scale.

BGP values specificity and shortness of path - due to which two major attacks are prefix hijacking and one-hop attack.

### RPKI

RPKI (Resource Public Key Infrastructure) is a cryptographic framework used to secure the routing infrastructure of the internet. It is designed to prevent the propagation of invalid or unauthorized route announcements and mitigate the risks associated with BGP hijacking and route leaks. RPKI provides a mechanism for verifying the authenticity and authorization of route announcements by associating them with the rightful owner of IP address prefixes. Here's how RPKI works:

1. Resource Certification Authorities (RCAs):
RCAs are trusted entities that issue digital certificates to resource holders, such as internet service providers (ISPs) and autonomous systems (ASes). These certificates bind the IP address prefixes to the cryptographic keys of the resource holders. RCAs are responsible for verifying the ownership and authorization of the resources.

2. Route Origin Authorization (ROA):
A ROA is a digitally signed object created by a resource holder using their private key. It contains the IP address prefix and the AS number authorized to originate that prefix. The ROA also includes other attributes, such as the maximum prefix length and validity period. The ROA is then published in the RPKI repository.

3. RPKI Repository:
The RPKI repository is a centralized or distributed collection of digital objects that store the ROAs and related certificates. It acts as a publicly accessible database that contains the cryptographic proof of ownership and authorization of IP address prefixes.

4. Relying Party:
   A relying party is typically an ISP or network operator that wants to validate the authenticity and authorization of route announcements received from its peers. The relying party performs the following steps:

   a. Retrieval: The relying party retrieves the ROAs and certificates from the RPKI repository using the Resource Public Key Infrastructure/Router Protocol (RPKI/RTR) or other protocols.

   b. Validation: The relying party verifies the digital signatures of the certificates and ROAs using the public keys obtained from the certificates. It also checks the relationship between the AS number in the route announcement and the authorized AS number in the corresponding ROA. If the validation process succeeds, it confirms that the route announcement is legitimate.

   c. Route Filtering: Based on the validation results, the relying party decides whether to accept or reject the received route announcement. If the route is invalid or unauthorized, it can be filtered out to prevent its propagation.

By deploying RPKI, network operators can enhance the security and reliability of their routing infrastructure. It provides a means to validate the legitimacy of route announcements, reducing the risk of BGP hijacks, route leaks, and other routing incidents that can disrupt network connectivity and compromise data integrity.

Overall, RPKI plays a crucial role in securing the BGP routing system by enabling resource holders to cryptographically prove their ownership of IP address prefixes and allowing network operators to validate the authenticity of route announcements.

Here's a simplified example of a chain of cryptographic certificates in RPKI:

1. Root Certificate Authority (CA):
At the top of the chain is the Root CA, which is the highest level of authority in the RPKI hierarchy. The Root CA issues certificates to subordinate CAs and signs their certificates. The Root CA's certificate is self-signed.

- Root CA Certificate:
  - Issued to: Root CA
  - Public Key: PK_RootCA
  - Signature: Sig_RootCA(PK_RootCA)

2. Subordinate Certificate Authority (Sub-CA):
Below the Root CA, there can be one or more Sub-CAs, which are responsible for issuing certificates to resource holders and signing their certificates.

- Sub-CA Certificate:
  - Issued to: Sub-CA
  - Public Key: PK_SubCA
  - Signature: Sig_RootCA(PK_SubCA)

3. Resource Holder Certificate:
Resource holders, such as ISPs or ASes, obtain certificates from the Sub-CA. These certificates bind the IP address prefixes to the cryptographic keys of the resource holders.

- Resource Holder Certificate 1:
  - Issued to: Resource Holder 1
  - IP Prefix: 192.0.2.0/24
  - AS Number: AS12345
  - Public Key: PK_RH1
  - Signature: Sig_SubCA(PK_RH1, IP Prefix, AS Number)

- Resource Holder Certificate 2:
  - Issued to: Resource Holder 2
  - IP Prefix: 203.0.113.0/24
  - AS Number: AS67890
  - Public Key: PK_RH2
  - Signature: Sig_SubCA(PK_RH2, IP Prefix, AS Number)

These certificates form a chain of trust, where the Root CA certificate is self-signed, the Sub-CA certificate is signed by the Root CA, and the Resource Holder certificates are signed by the Sub-CA.

When a relying party retrieves the certificates from the RPKI repository, it can verify the digital signatures using the corresponding public keys. This validation process establishes the authenticity and authorization of the IP address prefixes associated with the resource holders.

Please note that this example provides a simplified representation of the certificate chain in RPKI. In practice, there may be additional levels of hierarchy and more complex certificate structures depending on the RPKI deployment.

### BGPSec

BGPsec (Border Gateway Protocol Security) is an extension to the BGP protocol designed to enhance the security and integrity of BGP routing information. BGPsec addresses the vulnerabilities in BGP, such as the potential for route hijacking, route leaks, and the injection of unauthorized routing information. It uses cryptographic mechanisms to validate the authenticity and integrity of BGP route announcements. Here's how BGPsec works:

1. Certificate Authorities (CAs):
BGPsec relies on a public key infrastructure (PKI) that includes one or more trusted CAs. These CAs are responsible for issuing digital certificates to participating BGP routers. The certificates bind the routers' public keys to their identity, ensuring the authenticity of their BGP route announcements.

2. Router Certificates:
Each BGP router participating in BGPsec is required to have a digital certificate issued by a trusted CA. The router certificate contains the router's public key, identity information, and the CA's digital signature.

3. Route Origin Validation (ROV):
ROV is a critical component of BGPsec that verifies the authenticity of route announcements. It involves the following steps:

   a. Origin Validation:
      - When a BGP router receives a route announcement, it checks if the originating AS (AS path) has a valid digital certificate issued by a trusted CA.
      - The router validates the digital signature of the certificate using the CA's public key obtained from a trusted source (e.g., through the PKI).

   b. Path Validation:
      - The receiving router performs a cryptographic validation of the AS path to ensure that it has not been tampered with during transit.
      - It uses the public keys from the certificates in the AS path to verify the integrity of the path.

4. BGPsec Signaling:
To indicate BGPsec support and enable secure BGP sessions, routers exchange BGPsec-specific attributes and signaling messages during the BGP session establishment process.

5. BGPsec Path Attribute:
BGPsec introduces a new path attribute, called the BGPsec path attribute, which carries the cryptographic information necessary for path validation. This attribute includes digital signatures and cryptographic hashes that provide proof of authenticity and integrity.

By deploying BGPsec, network operators can significantly improve the security of BGP routing. It enables routers to validate the legitimacy of route announcements, preventing the propagation of unauthorized or tampered routing information. BGPsec helps to mitigate the risks of BGP hijacking, route leaks, and other attacks that can lead to connectivity disruptions and data compromise.

It's important to note that BGPsec adoption requires coordination and support from both network operators and router vendors. The successful deployment of BGPsec relies on establishing a robust PKI infrastructure, ensuring wide-scale adoption, and implementing secure routing policies across ASes.

**BGPsec vs RPKI**

BGPsec and RPKI are two complementary technologies that aim to enhance the security of BGP routing, but they address different aspects of the routing infrastructure. Let's compare BGPsec and RPKI:

1. Purpose:
- BGPsec: BGPsec focuses on securing the routing information exchanged between BGP routers. It provides mechanisms to ensure the authenticity and integrity of BGP route announcements, preventing attacks such as route hijacking and tampering.
- RPKI: RPKI focuses on securing the allocation and validation of IP address resources. It establishes a framework for verifying the ownership and authorization of IP address prefixes and preventing the propagation of invalid or unauthorized route announcements.

2. Security Mechanism:
- BGPsec: BGPsec relies on digital signatures and cryptographic mechanisms to validate the authenticity and integrity of BGP route announcements. It uses certificates issued by trusted CAs and performs path validation to ensure the legitimacy of the announced routes.
- RPKI: RPKI also uses digital certificates issued by trusted CAs, but its primary focus is on verifying the ownership and authorization of IP address prefixes. RPKI allows network operators to associate IP address prefixes with cryptographic keys, creating a chain of trust that enables validation of route announcements.

3. Deployment and Adoption:
- BGPsec: BGPsec deployment requires support from both network operators and router vendors. It involves enabling BGPsec capabilities in routers, establishing a robust PKI infrastructure, and ensuring coordination among ASes for successful adoption.
- RPKI: RPKI deployment involves the creation and maintenance of a centralized or distributed repository of certificates and ROAs. Network operators need to issue certificates and create ROAs to assert their ownership of IP address prefixes. RPKI adoption is driven by the participation of ASes and the validation of route announcements based on the RPKI information.

4. Benefits and Limitations:
- BGPsec: BGPsec provides end-to-end security for BGP route announcements, preventing malicious modifications or hijacks. However, BGPsec can be more computationally intensive and has a higher implementation complexity compared to RPKI.
- RPKI: RPKI helps prevent the propagation of unauthorized or invalid route announcements by providing a mechanism for validating the legitimacy of IP address ownership. It can significantly reduce the risk of route leaks and hijacks. However, RPKI relies on the accurate maintenance of certificates and ROAs, and its effectiveness depends on wide-scale adoption and validation by network operators.

In summary, while BGPsec focuses on securing the integrity of BGP route announcements, RPKI addresses the verification of IP address ownership and authorization. Both technologies play important roles in enhancing the security of the BGP routing system, and their combined deployment can provide a more robust and secure routing infrastructure.

### TLS 

TLS (Transport Layer Security) is a cryptographic protocol designed to provide secure communication over a network, typically the internet. It ensures the confidentiality, integrity, and authenticity of data exchanged between client and server applications. TLS is the successor to SSL (Secure Sockets Layer) and is widely used to secure various types of communication, including web browsing, email, instant messaging, and more. Here's a detailed explanation of TLS:

1. Handshake Protocol:
The TLS handshake protocol is the initial phase of establishing a secure connection between a client and a server. It involves the following steps:

- Client Hello: The client sends a Client Hello message to the server, which includes the TLS version, a list of supported cipher suites (encryption algorithms), and other parameters.
- Server Hello: The server responds with a Server Hello message, selecting the TLS version, cipher suite, and other negotiated parameters from the client's list.
- Certificate Exchange: The server sends its digital certificate, which contains its public key and other identifying information. The client verifies the authenticity of the certificate using trusted Certificate Authorities (CAs).
- Key Exchange: The client generates a random pre-master secret and encrypts it with the server's public key obtained from the certificate. This pre-master secret will be used to derive session keys for secure communication.
- Session Establishment: Both client and server independently derive the session keys from the pre-master secret. They confirm the successful establishment of the session, and subsequent communication will be encrypted and protected.

2. Key Exchange Algorithm:
The key exchange algorithm used in the TLS handshake depends on the selected cipher suite. Common key exchange methods include:

- RSA (Rivest-Shamir-Adleman): The client encrypts the pre-master secret with the server's RSA public key.
- Diffie-Hellman (DH): The client and server perform a Diffie-Hellman key exchange to establish a shared secret, which is then used to derive the session keys.
- Elliptic Curve Diffie-Hellman (ECDH): Similar to DH, but using elliptic curve cryptography for key exchange, providing better security with smaller key sizes.

3. Encryption and Data Transfer:
Once the handshake is complete, the client and server use the negotiated session keys to encrypt and decrypt data during the TLS session. TLS supports various symmetric encryption algorithms, such as AES (Advanced Encryption Standard), and authentication mechanisms, such as HMAC (Hash-based Message Authentication Code), to ensure data confidentiality and integrity.

4. Certificate Validation:
During the handshake, the client verifies the server's certificate to ensure its authenticity. This involves checking the certificate's validity, verifying the digital signature, and ensuring it is issued by a trusted CA. If the validation fails, the client may terminate the connection or prompt the user with a warning.

5. Renegotiation and Session Resumption:
TLS supports renegotiation, allowing the client and server to modify the parameters of an established session. Renegotiation is used, for example, to switch to a different cipher suite or extend the session's duration. Additionally, TLS supports session resumption, where a client can reuse a previously established session, avoiding the need for a full handshake.

TLS is a crucial component of secure communication on the internet, providing privacy and integrity for sensitive data transmission. It protects against eavesdropping, tampering, and impersonation attacks, ensuring that communication between clients and servers remains secure.

### OPAQUE

OPAQUE (Oblivious Password Authentication with Strong Security) is a password-based authentication protocol that aims to enhance the security and privacy of user passwords during the authentication process. It allows users to authenticate themselves to a server without revealing their passwords or vulnerable password-equivalent information, such as hashed passwords or verifiers. OPAQUE achieves this by leveraging a cryptographic technique called password-authenticated key exchange (PAKE). Here's an explanation of how OPAQUE passwords work:

1. Registration Phase:
During the registration phase, the user and the server establish a shared secret, known as the "blinded password verifier." The process involves the following steps:

- User Setup: The user generates a cryptographic key pair consisting of a private key (x) and a corresponding public key (X). The user also computes a commitment value (C) based on their password and the public key.
- Server Setup: The server generates its own cryptographic key pair, comprising a private key (y) and a corresponding public key (Y). The server also computes a blinded password verifier (V) using the user's commitment value (C) and the server's private key (y).

2. Authentication Phase:
During the authentication phase, the user and the server interact to establish a secure session key. The password remains confidential throughout this process. The steps involved are as follows:

- User's Authentication Request: The user sends their username and the public key (X) to the server.
- Server's Challenge: Upon receiving the user's authentication request, the server generates a random challenge value (s) and sends it to the user.
- Blinded Password Response: The user performs a calculation on their private key (x) and the challenge (s) to create a blinded password response (BPR).
- Unblinding and Key Computation: The server receives the blinded password response (BPR) from the user, unblinds it using the server's private key (y), and computes the session key (K) and the server-side authentication proof.
- User's Key Computation: The user computes the session key (K) and the client-side authentication proof based on the blinded password response (BPR).
- Verification: The server and the user exchange their authentication proofs. If they match, the server grants the user access, and both sides can use the session key (K) for secure communication.

OPAQUE provides security against offline dictionary attacks, where an attacker attempts to guess a user's password by repeatedly submitting password guesses to the server. It ensures that the server cannot obtain any useful information to perform password cracking, even if it becomes compromised.

By using OPAQUE, users can authenticate themselves securely without disclosing their passwords or password-equivalent information to the server, preserving their privacy and reducing the risk of password-based attacks.

### Tor

The Onion Router (Tor) is a privacy-focused network protocol and software system that enables anonymous communication over the internet. Tor is designed to protect the privacy and anonymity of users by routing their network traffic through a series of volunteer-operated servers called Tor relays. Here's a detailed explanation of how the Onion Router works, along with an example:

1. Onion Routing Concept:
The core concept behind Tor is "onion routing." This involves wrapping data packets in multiple layers of encryption, similar to the layers of an onion, before transmitting them through the Tor network. Each layer is peeled off at each relay, revealing the next destination in the route, until the final destination is reached.

2. Tor Network Architecture:
The Tor network consists of three types of nodes:

- Entry Nodes (Guard Nodes): These are the initial nodes in the Tor network that receive the user's encrypted data packets. They are responsible for removing the outermost layer of encryption and forwarding the packets to the next node.
- Middle Nodes: These nodes receive the data packets from the entry nodes, decrypt the outer layer of encryption, and forward them to the next node in the circuit.
- Exit Nodes: The final nodes in the Tor network receive the decrypted data packets from the previous relay and send them to their intended destination on the internet.

3. Establishing a Circuit:
Before transmitting data, Tor establishes a circuit through a series of relays. The circuit is a path consisting of multiple relays that the user's data will traverse. Tor selects these relays randomly and changes them periodically to enhance anonymity. The circuit is encrypted end-to-end, ensuring that no individual relay can decrypt the entire route.

4. Data Transmission:
Once the circuit is established, data transmission occurs in the following manner:

- Encryption Layers: The user's data packets are encrypted multiple times, with each encryption layer corresponding to a relay in the circuit. Each relay in the path only knows the previous and next relay in the circuit, providing strong anonymity.
- Onion Routing: The encrypted data packets are sent from the user's device to the entry node. The entry node decrypts the outermost layer and forwards the packet to the next relay. This process continues until the packet reaches the exit node, which decrypts the final layer and sends the data to its destination on the internet.

5. Anonymity and Privacy:
The multi-layer encryption and routing through multiple relays in Tor provide anonymity and privacy for users. It becomes extremely difficult for any single entity to trace the origin or destination of the data packets or identify the user behind the communication.

Example Scenario:
Let's say a user wants to access a website anonymously using Tor:

- The user's Tor software establishes a circuit with three randomly chosen relays: Relay A, Relay B, and Relay C.
- The user's data packets are encrypted in layers, with Relay A's encryption as the outermost layer, followed by Relay B's encryption, and finally Relay C's encryption.
- The encrypted data packets travel from the user's device to Relay A, where the outermost encryption layer is decrypted.
- Relay A forwards the partially decrypted data to Relay B, which decrypts its layer and forwards the data to Relay C.
- Relay C decrypts the final layer and sends the data to the destination website on the internet.
- The website receives the data without knowing the user's real IP address or identity.

Throughout this process, the user's anonymity is preserved as no single relay knows the complete path or the user's identity, and the website only sees the exit node's IP address.

Tor's design and implementation provide a robust system for anonymous communication, enabling users to browse the internet and access online resources without revealing their identity or location.

**Tor Cells**

1. CREATE: The CREATE cell is used to create a circuit between the Tor client and a relay. It contains the necessary information to establish a connection with a relay and initiate the circuit creation process.
2. CREATED: The CREATED cell is sent by a relay in response to a CREATE cell. It confirms the successful creation of a circuit and includes the necessary information to identify the circuit.
3. RELAY: The RELAY cell is the primary data-carrying cell in the Tor network. It encapsulates the user's data packets and carries them through the circuit. RELAY cells are encrypted with the encryption keys negotiated during the circuit creation process.
4. DESTROY: The DESTROY cell is used to tear down a circuit. It is sent by either the client or a relay to signal the termination of the circuit. The DESTROY cell includes the reason for the circuit termination.
5. CREATE_FAST: The CREATE_FAST cell is an optimization technique that allows for faster circuit creation. It is used when the client already has a precomputed value for the initial part of the circuit creation process.
6. NETINFO: The NETINFO cell is used for network status and connection information exchange between the client and a relay. It contains details such as the relay's IP address, port, and version information.
7. PADDING: The PADDING cell is used for traffic padding purposes. It helps to obfuscate the size and timing patterns of the network traffic, improving anonymity by making it harder for an observer to determine the exact size of the encrypted packets.

<u>Attacking Tor:</u> Timing Attacks and Traffic Analysis.

The Tor directory service is a critical component of the Tor network that provides information about the network's relays, their current status, and network topology. It acts as a central directory where Tor clients (users) can obtain necessary information to establish circuits and communicate securely. Here's an overview of the Tor directory service:

1. Directory Authorities:
The Tor directory service is maintained by a set of trusted servers known as Directory Authorities (DAs). These DAs are operated by trusted individuals or organizations within the Tor community. They are responsible for collecting information about Tor relays, verifying their authenticity, and publishing the directory information.

2. Directory Structure:
The directory service maintains a hierarchical structure of directories, with multiple levels of information. The top-level directory is known as the "consensus" document, which contains high-level information about all Tor relays currently active in the network. This includes their IP addresses, cryptographic identities, and other details.

Below the consensus document, there are separate directories for different aspects of the network, such as network statuses, relay descriptors, and statistics. These directories provide more detailed information about relays, their bandwidth capacity, exit policies, and other relevant metadata.

3. Directory Fetching:
Tor clients periodically fetch the directory information from the Tor directory service to stay updated with the network's current state. The directory fetch process involves the following steps:

- Initial Directory Fetch: When a Tor client starts, it contacts a preconfigured directory authority to obtain the initial consensus document and directory information.
- Directory Mirrors: To distribute the load and improve scalability, Tor clients can fetch directory information from directory mirrors. These mirrors are maintained by volunteers who synchronize their copies of the directory service with the directory authorities.
- Directory Caching: Tor clients cache the fetched directory information locally to minimize the frequency of directory fetches. The cached information is periodically refreshed to ensure its accuracy and to obtain the latest network state.

4. Directory Authentication:
To ensure the integrity and authenticity of the directory information, the Tor directory service utilizes cryptographic mechanisms. The consensus document and other directory information are digitally signed by the directory authorities using their private keys. Tor clients verify these digital signatures using the directory authorities' public keys to ensure the information hasn't been tampered with.

The Tor directory service plays a vital role in facilitating the operation of the Tor network. It provides Tor clients with up-to-date information about relays, enabling them to build circuits, select entry and exit points, and establish secure and anonymous communication. By relying on the directory service, Tor clients can navigate the network and utilize its anonymity features effectively.

### PGP and E2E



### Forward Secrecy 




