# xsens-to-osc

# Capture UPD stream with wireshark
# List interfaces with `bittwist -d`
# play with `sudo bittwist -i 4 xsens.s0i0.pcap -vv`


# OSC messages to send!

* voorgeprogrammeerde (of live aangestuurd) track: akkoordhoogte
* arpegiator: gesnapped op een akkoord
* CC parameters: VKB_MIDI_CC i/vkb_midi/@/cc/@ f/vkb_midi/@/cc/@ i/vkb_midi/cc/@ f/vkb_midi/cc/@
* FX parameters (bv frequency sweep van een EQ), bv FX_EQ_LOPASS_FREQ n/fxeq/lopass/freq n/track/@/fxeq/lopass/freq
* theremin achtige setting (volume + pitch)