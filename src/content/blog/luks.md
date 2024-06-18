---
title: Encrypting a Virtual Disk with LUKS
description: Learn how to create an encrypted virtual disk using LUKS on Linux.
date: "2021-09-26"
---

## Step 1: Creating a Virtual Disk
To begin, we'll create a virtual disk image that will act as our encrypted partition. We can use the `dd` command to create a file of a specified size filled with zeros:

```bash
dd if=/dev/zero of=virtual_disk.img bs=1M count=1024
```

This command creates a file named "virtual_disk.img" with a size of 1024 megabytes (1 GB).

## Step 2: Associating the Virtual Disk with a Loop Device
Next, we need to make the virtual disk image accessible as a block device. We can achieve this by associating it with a loop device using the `losetup` command:

```bash
sudo losetup -fP virtual_disk.img
```

## Step 3: Encrypting the Virtual Disk
Now that we have a virtual disk set up, let's encrypt it using `cryptsetup` and LUKS. In this example, we'll use a passphrase "cafebabe" for encryption. It's important to choose a strong passphrase in real-world scenarios.

```bash
echo -n cafebabe | sudo cryptsetup luksFormat /dev/loopX -
```

Replace "/dev/loopX" with the actual loop device assigned to your virtual disk (e.g., /dev/loop0).

## Step 4: Opening the Encrypted Disk
To access the encrypted disk, we need to open (decrypt) it using the same passphrase:

```bash
echo -n cafebabe | sudo cryptsetup open /dev/loopX my_encrypted_vp -
```

This command decrypts the virtual disk and maps it to a new device at "/dev/mapper/my_encrypted_vp".

## Step 5: Creating a Filesystem
After decrypting the virtual disk, we need to create a filesystem on it to store our files:

```bash
sudo mkfs.ext4 /dev/mapper/my_encrypted_vp
```

## Step 6: Mounting the Encrypted Volume
Finally, we can mount the decrypted volume to a mount point to access and modify its contents:

```bash
sudo mount /dev/mapper/my_encrypted_vp /mnt/encrypted_vp
```

## Step 7: Accessing the Encrypted Contents
With the encrypted volume mounted, we can now peek inside and browse its contents using standard Linux commands like `ls`:

```bash
ls -l /mnt/encrypted_vp
```

This command will display the files and directories stored within the encrypted virtual disk.

## Performing an update via a `rootfs`

You might decide you need to do OTAs or some other form of updates, the easiest way to go about this on another's system with an encrypted disk is to create a `rootfs.tar`.