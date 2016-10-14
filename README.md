# squarehook-challenge
## Usage/Installation
- Active at [dcwright.xyz/squarehook/](https://dcwright.xyz/squarehook/)
- Alternativly clone onto own system and serve

## Frameworks
- Backbone.js

## Methodology/Algorithms
### State Space Modeling
State object represents a node in the state space. A tree rooted at the state
with a board of all blank spaces can be used to generate the entire state space

### Computer Move Selection (Minmax)
Used minmax algorithm to search the tree for a move that leads to a computer
win or tie. 

### Optimization: Transposition Table
Used a transposition table to optimize generation of states. Entries in table
are indexed by the corresponding State string. If the State is already in the
table the table instance is used instead of generating the node's children
again
