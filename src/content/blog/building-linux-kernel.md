---
title: "Building and Booting a Linux Kernel from scratch"
description: How to Build and Boot a Custom Linux Kernel Using QEMU Without Risking Your System
date: "2024-05-01"
---

> READ BEFORE COPY PASTING COMMANDS!

QEMU is a powerful open-source machine emulator and virtualizer. We don't wan to play around too much on our system, so best to use QEMU. Before starting, ensure QEMU is installed on your system. Installation commands vary by distribution:

- Debian/Ubuntu: `sudo apt-get install qemu`

Obtain the latest Linux kernel source from [kernel.org](https://www.kernel.org/). Extract the archive and prepare for compilation:
```bash
git clone https://github.com/torvalds/linux.git
cd linux

tar xvf linux-*.tar.xz
cd linux-*
make defconfig
nproc
make -j<number of processing units to allocate - ideal is maximum minus 2 so you can do other things while it builds>
```
This process compiles the kernel with default configurations, which is sufficient for basic experimentation.


A root filesystem is necessary for the kernel to boot into. `Debootstrap` allows you to create a Debian or Ubuntu-based filesystem easily.

1. **Install `debootstrap`**:
   - On Debian/Ubuntu: `sudo apt-get install debootstrap qemu-user-static`

2. **Bootstrap the Filesystem**:
   ```bash
   mkdir myrootfs
   sudo debootstrap --arch=amd64 buster myrootfs http://deb.debian.org/debian/
   ```
   Replace `buster` with your preferred Debian version or use an Ubuntu mirror for Ubuntu-based systems.

During the `debootstrap` process, you might encounter errors such as `E: Tried to extract package, but file already exists. Exit.` This typically occurs if the process was interrupted or if there were issues with the filesystem. To resolve, ensure the `myrootfs` directory is empty or recreate it:
```bash
sudo rm -rf myrootfs
mkdir myrootfs
```
Then, rerun the `debootstrap` command.

After successfully creating a root filesystem, you'll need to convert it into a format QEMU can boot from, but first you might need to do a few configurations for login and such.

This step allows you to operate within your newly created filesystem as if it were a running system.

```sudo mount --bind /dev myrootfs/dev
sudo mount --bind /proc myrootfs/proc
sudo mount --bind /sys myrootfs/sys
sudo chroot myrootfs
```

Within the chroot environment, you can add user accounts, set passwords, and make other system configurations.

```
adduser myusername  # Replace 'myusername' with your desired username
passwd myusername  # Set the password for the user
```

Next, unmount.

```
exit
sudo umount myrootfs/dev
sudo umount myrootfs/proc
sudo umount myrootfs/sys
```

Great, now you're ready to convert!

```bash
dd if=/dev/zero of=rootfs.img bs=1G count=0 seek=2
mkfs.ext4 -F rootfs.img
sudo mount -o loop rootfs.img mnt
sudo cp -a myrootfs/. mnt/.
sudo umount mnt
```
This process creates a 2 GB `rootfs.img` file, formatted as ext4, which QEMU can use as a disk image.


Finally, boot your custom kernel alongside the newly created root filesystem image using QEMU:
```bash
qemu-system-x86_64 -kernel arch/x86/boot/bzImage -hda rootfs.img -append "root=/dev/sda console=ttyS0" -nographic
```
This command starts a virtual machine running your custom kernel. The `-nographic` option is used for a headless setup, ideal for server environments or automation tasks.


<a href="https://ibb.co/fdFmBpz"><img src="https://i.ibb.co/whgD3WF/image-20240216220556122.png" alt="image-20240216220556122" border="0"></a><br /><a target='_blank' href='https://imgbb.com/'>upload pic</a><br />