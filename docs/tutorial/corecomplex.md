---
id: corecomplex
title: Running a core-complex model
sidebar_position: 2
---

# Running a coupled core-complex model

This page walks through the parameter file behind the Gaussian-fault model of Keum, Choi & So (submitted): a 100 × 80 × 20 km box, a brittle layer over a weak ductile layer, a 45°-dipping inherited fault whose position undulates along strike, 1.5 cm/yr extension on each side, and FastScape on the top boundary. The same setup, with FastScape replaced by goSPL, is the reference case of the [DES3D–goSPL tutorial](https://geoflac.github.io/des3d/docs/tutorial/couplinggospl).

The full `.prm` is in the repository under `examples/gaussian-corecomplex-3d-fastscape.prm`. Only the parts that matter for the coupling are shown here.

## Geometry and mesh

```
subsection Geometry model
  set Model name = box
  subsection Box
    set X repetitions = 5
    set Y repetitions = 4
    set Z repetitions = 1
    set X extent      = 100e3
    set Y extent      = 80e3
    set Z extent      = 20e3
  end
end

subsection Mesh refinement
  set Initial global refinement          = 4
  set Initial adaptive refinement        = 1
  set Time steps between mesh refinement = 1
  set Strategy = maximum refinement function, composition threshold
  subsection Maximum refinement function
    set Function expression = if(z<=15e3, 3, 3)
  end
  subsection Composition threshold
    set Compositional field thresholds = ..., 0.1, 0.1, ...   # plastic strain fields
  end
end
```

The box is 5 × 4 × 1 cells of 20 km before refinement. The maximum refinement function caps the mesh at level 3 (2.5 km cells) and the composition threshold adds one level (1.25 km) wherever plastic strain exceeds 0.1, so the fault zone is refined and the rest of the box stays coarse. With Q2 velocity elements the velocity nodes on a 1.25 km cell are 625 m apart. The surface can reach level 4 where the fault breaches it, which is why `Maximum surface refinement level` below is 4.

## Surface processes

```
subsection Mesh deformation
  set Mesh deformation boundary indicators = top : fastscape
  set Additional tangential mesh velocity boundary indicators = left, right

  subsection Free surface
    set Surface velocity projection = normal
    set Free surface stabilization theta = 0.8
  end

  subsection Fastscape
    set Maximum surface refinement level = 4
    set Surface refinement difference    = 2
    set Additional fastscape refinement  = 1
    set Number of fastscape timesteps per aspect timestep = 5
    set Maximum timestep length = 10000
    set Fastscape seed          = 1000
    set Use ghost nodes         = true
    set Vertical exaggeration   = 1

    subsection Boundary conditions
      set Right = 1
      set Left  = 1
    end

    subsection Erosional parameters
      set Drainage area exponent        = 0.4   # m
      set Slope exponent                = 1     # n
      set Bedrock river incision rate   = 1e-5  # K_f  [m^(1-2m)/yr]
      set Bedrock diffusivity           = 1e-2  # K_d  [m^2/yr]
      set Bedrock deposition coefficient = 1    # G
      set Multi-direction slope exponent = -1   # p  (-1: single-direction flow)
    end
  end
end
```

What each choice does:

- `top : fastscape` attaches the plugin to the top boundary. `left, right` are listed as additional tangential mesh velocity boundaries so the deforming top can slide along the side walls.
- `Maximum surface refinement level = 4` is the finest level that can occur on the surface. `Additional fastscape refinement = 1` makes the FastScape grid one level finer than that: `dx = 100 km / (2^5 × 5) = 625 m`, 161 × 129 nodes plus the ghost ring. `Surface refinement difference = 2` allows surface cells up to two levels coarser than the maximum (level 2, 5 km), which covers the level-3 cells that make up most of the surface.
- `Number of fastscape timesteps per aspect timestep = 5` and `Maximum timestep length = 10000` together set the sub-stepping: five sub-steps unless the ASPECT step is longer than 50 kyr, in which case the count doubles until each sub-step is under 10 kyr. With `CFL number = 0.2` the ASPECT step in these runs is a few kyr.
- `Use ghost nodes = true` with `Left = Right = 1` fixes the elevation on the ghost ring at the two extension-parallel sides, outside the ASPECT edge. `Front` and `Back` keep their default.
- The stream-power parameters follow Neuharth et al. (2022): `m = 0.4`, `n = 1`, `K_f = 1e-5`, `K_d = 1e-2 m²/yr`, `G = 1`. The runs in the submitted paper also use `K_f = 5e-5` as the stronger-erosion case.

## Boundary conditions that interact with the surface

```
subsection Boundary velocity model
  set Tangential velocity boundary indicators = front, back
  set Prescribed velocity boundary indicators = left x: function, right x: function
  subsection Function
    set Function constants  = cm=0.01, year=1, vel=1.5
    set Function expression = if (x<50e3, -vel*cm/year, vel*cm/year); 0; 0;
  end
end

subsection Boundary traction model
  set Prescribed traction boundary indicators = bottom : initial lithostatic pressure
end
```

Extension is imposed as an outflow velocity on the two side walls. The box does not widen; material leaves through the sides, and the FastScape grid, which covers the box, does not need to grow. The bottom carries the initial lithostatic pressure as a traction, a Winkler-type foundation that lets the footwall rise isostatically.

## Running

```bash
mpirun -np 64 ./aspect gaussian-corecomplex-3d-fastscape.prm
```

Watch the log for the `Executing FastScape...` line at every step. ASPECT writes its `.pvtu` series into the output directory; FastScape writes its own grid as `output/fastscape/*.vtk` at the graphical output interval, with topography, drainage area and the chosen extra field (`kf` by default).

## What to look for

- A single footwall dome at the Gaussian bulge of the inherited fault, widening along strike with `sigma`.
- Extension-parallel corrugations on the exhumed footwall, carved by rivers that run down the dome flank (the fluvial band, 3–12 km wavelength in the along-strike profiles).
- The hanging-wall basin filling with sediment; compare the `noSP` run, where the dome keeps its tectonic shape and the basin stays open.

## Exercises

1. Run the reference case for 1 Myr (about 300 ASPECT steps) and plot topography and plastic strain at 0.33, 0.66 and 1.0 Myr.
2. Change `Bedrock river incision rate` to `1e-6` and `5e-5`, one at a time, and compare the dome height and the corrugation amplitude.
3. Set `Use ghost nodes = false` and look at the two x boundaries of the FastScape output: the edge nodes are now pinned on the ASPECT boundary itself.
4. Set `Mesh deformation boundary indicators = top : free surface` (no FastScape) to reproduce the `noSP` case.
