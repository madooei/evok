# Demo 04: Evaluator-Optimizer Pattern

## Purpose

This demo demonstrates the **evaluator-optimizer pattern** where one component generates solutions while another provides evaluation and feedback in an iterative loop, leading to progressively better results through continuous refinement.

## What It Demonstrates

- **Iterative improvement** through generate-evaluate-refine cycles
- **Quality-driven termination** based on evaluation criteria
- **Progressive refinement** with measurable improvement over iterations
- **Feedback loops** between generation and evaluation components

## The Pattern: Evaluator-Optimizer

This pattern implements a continuous improvement loop:

1. **Generate** - Create an initial solution or improvement
2. **Evaluate** - Assess quality against defined criteria
3. **Decide** - Continue iterating or accept the solution
4. **Refine** - Use feedback to improve the next iteration

## Key Benefits

- **Quality assurance** through systematic evaluation
- **Iterative improvement** leading to better final results
- **Clear termination criteria** preventing endless loops
- **Measurable progress** with scoring and feedback
- **Error correction** through multiple refinement cycles

## Implementation Highlights

- **Scoring system** (1-10) with clear thresholds
- **Detailed feedback** for each evaluation
- **Iteration tracking** to monitor progress
- **Approval mechanism** to terminate when quality is sufficient
- **Progressive examples** showing improvement over iterations

## Example Evolution Shown

1. **Iteration 1**: Naive recursive fibonacci (score: 3) - functional but inefficient
2. **Iteration 2**: Memoized version (score: 7) - much better performance
3. **Iteration 3**: Iterative solution (score: 9) - optimal and clean

## When to Use

- **Solution quality is critical** and worth the extra processing time
- **Clear evaluation criteria** can be defined and measured
- **Iterative refinement** provides measurable value
- **Domain expertise** can be encoded in the evaluator
- **Time permits multiple iterations** for better results

## Real-World Applications

- Code generation and optimization
- Creative writing with quality feedback
- Design iteration with aesthetic evaluation
- Scientific hypothesis refinement
- Marketing copy optimization
- Technical documentation improvement
- Algorithm design and optimization

This pattern is powerful for applications where the initial solution quality may be insufficient and systematic improvement through evaluation leads to significantly better outcomes.
