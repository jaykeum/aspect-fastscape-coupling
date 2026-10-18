---
id: intro
title: Overview
sidebar_position: 1
slug: /
---

# ASPECT–FastScape coupling

This site explains how the geodynamic code **ASPECT** and the landscape evolution model **FastScape** are coupled, and how to run a coupled three-dimensional core-complex model. It was written for the talk *Coupling ASPECT and FastScape* at the GeoFLAC/DynEarthSol Workshop & Hackathon 2026 (KIGAM, Daejeon, 3 November 2026), and it is meant to be read next to the [DES3D–goSPL coupling tutorial](https://geoflac.github.io/des3d/docs/tutorial/couplinggospl): the two codes solve the same problem with two different mesh philosophies, and the differences are easier to see when the two descriptions follow the same layout.

## What is coupled

| Code | Role | Mesh |
|---|---|---|
| ASPECT | tectonics: Stokes flow with visco-elasto-plastic rheology, 3D | Eulerian / ALE hexahedra, adaptive refinement |
| FastScape | surface processes: river incision, hillslope diffusion, deposition, marine processes | regular 2D grid, fixed |

ASPECT drives the run. FastScape is a **mesh deformation plugin** in ASPECT: at every time step it receives the surface velocity, runs the landscape model for the same interval, and hands back a vertical velocity for the top boundary of the mesh.

## Pages

- [How the coupling works](./tutorial/couplingfastscape.md): the loop, step by step, with the animated figure, ghost nodes and time stepping.
- [Running a core-complex model](./tutorial/corecomplex.md): the parameter file used in Keum et al. (submitted), what to look for, and exercises.
- [Parameters](./reference/parameters.md): the `subsection Fastscape` entries.
- [ASPECT–FastScape vs DES3D–goSPL](./reference/aspect-vs-des.md): what the two coupling schemes share and where they differ.

## Versions

The description follows the FastScape plugin as it was in ASPECT **2.6.0-pre** (the main branch between the 2.5.0 and 3.0.0 releases), which is the version used for the models shown here, and it was checked against the 3.0.0 release. Differences introduced after 3.0.0 are flagged where they matter.
