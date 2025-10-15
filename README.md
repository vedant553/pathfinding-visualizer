# Pathfinding Algorithm Visualizer

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://python.org)
[![Pygame](https://img.shields.io/badge/Pygame-2.5.2-green)](https://pygame.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Overview
Pathfinding Algorithm Visualizer is an interactive tool built with Python and Pygame that visually demonstrates the A* (A-star) pathfinding algorithm. Create custom mazes by placing obstacles, set start/end positions, and watch the algorithm dynamically find the shortest path in real-time with smooth animations.

## Live Demonstration
![Pathfinding Visualization Demo](demo.gif)

## Key Features
- **Interactive Grid**: Dynamically place start nodes, end nodes, and barrier nodes
- **Real-time Visualization**: Watch the algorithm explore open/closed nodes step-by-step
- **Path Reconstruction**: See the final path drawn smoothly with animation delays
- **Intuitive Controls**: Simple mouse and keyboard interactions
- **Modern UI**: Clean dark-themed interface with visual feedback

## Tech Stack
- Python 3.11+
- Pygame 2.5.2
- Manhattan distance heuristic
- Priority queue implementation (heapq)

## Setup and Installation
1. Clone repository:
```bash
git clone https://github.com/your-username/pathfinding-visualizer.git
cd pathfinding-visualizer
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install pygame
```

4. Run application:
```bash
python path_visualizer.py
```

## How to Use
| Control | Action |
|---------|--------|
| **Left Click** | First: Set Start<br>Second: Set End<br>Subsequent: Place Barriers |
| **Right Click** | Erase any node (start/end/barrier) |
| **Spacebar** | Start pathfinding visualization |
| **C Key** | Clear entire grid and reset |

## License
Distributed under the MIT License. See `LICENSE` for more information.
