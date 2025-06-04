# Demo 08: Conditional Processing Recipe

## Purpose

This demo shows a practical recipe for implementing business logic with conditional execution using the `createConditionalStep` helper, demonstrating how to apply premium discounts based on customer status and order value.

## What It Demonstrates

- **Business rule implementation** with conditional logic
- **Dynamic step execution** based on runtime state
- **Clean skip handling** when conditions aren't met
- **Custom event emission** for both execution and skip scenarios
- **Flexible condition evaluation** using state predicates

## The Conditional Processing Recipe

### Business Logic

- **Premium customer requirement** - Only premium customers eligible
- **Minimum order value** - Orders must exceed $100
- **Discount calculation** - 10% discount for qualifying orders
- **Skip handling** - Graceful handling when conditions aren't met

### Condition Evaluation

The condition combines multiple criteria:

```typescript
(state) => state.order.isPremium && state.order.total > 100;
```

### Event Handling

- **Success events** include discount details and final total
- **Skip events** provide clear reasoning for why discount wasn't applied
- **Workflow coordination** can react differently to success vs skip

## Key Benefits

- **Clean business logic separation** from workflow orchestration
- **Runtime decision making** based on current state
- **Explicit skip handling** with proper event emission
- **Flexible condition logic** supporting complex business rules
- **Audit trail** through event logging for compliance

## Condition Pattern Examples

### Simple Boolean Checks

```typescript
(state) => state.user.isVerified
(state) => state.account.balance > 0
```

### Complex Business Rules

```typescript
(state) => state.user.isPremium && state.order.total > threshold
(state) => state.user.region === 'US' && state.feature.enabled
```

### Time-Based Conditions

```typescript
(state) => new Date() > state.campaign.startDate
(state) => state.user.lastLogin > cutoffDate
```

## When to Use This Recipe

- **Business rule implementation** with clear conditions
- **Feature flags** and A/B testing scenarios
- **User permission checks** before sensitive operations
- **Promotional logic** with eligibility requirements
- **Data validation** before processing
- **Environment-specific behavior** (dev/staging/production)

## Real-World Applications

- E-commerce discount and promotion systems
- User access control and permissions
- Content personalization based on user segments
- Regulatory compliance checks
- Feature rollout and experimentation
- Subscription tier benefits
- Geographic restriction handling
- Time-based campaign activation

## Best Practices

- **Clear condition predicates** that are easy to understand and test
- **Meaningful skip events** that provide context for why conditions failed
- **Comprehensive event payloads** including relevant decision criteria
- **Defensive conditions** that handle edge cases gracefully
- **Audit-friendly events** for compliance and debugging

This recipe provides a robust foundation for implementing business logic that needs to make runtime decisions while maintaining clean separation of concerns and proper event-driven coordination.
