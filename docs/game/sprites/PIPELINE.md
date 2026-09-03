# Sprite pipeline

How every character in `prototypes/07-comb-sprites.html` was made, so the next
one is made the same way and the first complaint - "the characters are stupid"
- does not come back.

## The instrument

kie.ai, model `google/nano-banana`, text-to-image. The key is
`KIE_AI_API_KEY` on the Railway project `999` (service
`999-multibots-telegraf`); the user's own render service already bills against
it. Balance on 2026-09-03 19:52: 5,500 credits. A 1024x1024 image is one job.

`google/nano-banana-edit` (img2img against the style reference) answered
`Internal Error` on the first try; text-to-image with the style written out
held the engraving idiom without a reference, so that is the path.

## The prompt, in two parts

STYLE (fixed, `style.txt`): single centred sprite on PURE WHITE, 17th-century
copperplate engraving, cross-hatch, PURE BLACK INK ONLY - no colour, no wash,
no fill tones, no gold tint; every tone by line density; strong outer contour;
no text, frame, cartouche, caption, footer, logo, panels, ground shadow.

CHARACTER (per sprite): one paragraph. The five shipped ones are in
`prompts/`. The first probe omitted "no fill tones" and the model washed the
wings in gold; inverted for the dark field that wash became dark blotches. The
prohibition is not optional.

## Post-process (`postprocess.py`)

1. Luminance -> alpha: `alpha = ((255 - lum) / 255) ** 0.85`. The exponent
   keeps hatch lines crisp; linear alpha greys them.
2. Crop to the ink bounding box plus 24 px, squared.
3. Tint to the live page gold `#FFD45A` (`palette-live.md`). The line-work
   carries all the form; colour is one flat value.
4. Emit 1024 (master), 256 (field), 96 (far).
5. Preview composited on the field ground `#020806`.

## Sizing in the field

Cell side `S = 150` world units. A bee is drawn at `S * 0.42 * f` (f = the
projection factor), so a bee is roughly a third of its cell; the Queen at
`S * 0.95 * f`, nearly a full cell, seated on the centre cell. Sprites face
the direction of travel by a horizontal flip; the master faces right. Motion
is a 4% vertical bob, never a scale change, because scale reads as distance.

## What is NOT done

- No animation frames. One pose per character; the bob is code.
- No stage variants beyond LARVA. FORAGER / ARTISAN / WARDEN / ARCHON
  (`evolving-bees.md` §2.2) need four more renders per line.
- No portraits for the side panel.
- No ground tiles; the ground is still the flat hex fill from 06.
