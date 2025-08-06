# FindAll Sequence Diagram

The following diagram illustrates the flow of the `findAllWithQueryBuilder` method in the AbstractRepository class of the Smart API server package.

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant ZodValidationPipe
    participant Service
    participant Repository
    participant AbstractRepository
    participant QueryBuilder
    participant WhereBuilder
    participant SearchBuilder
    participant FilterBuilder
    participant SortBuilder
    participant Model
    participant PageMetaDto

    Client->>Controller: GET /users?search=john&page=1&limit=10
    Controller->>ZodValidationPipe: Validate query parameters
    ZodValidationPipe->>ZodValidationPipe: Parse and validate with Zod schema
    ZodValidationPipe-->>Controller: Return validated QueryOptionsDto
    Controller->>Service: findAll(queryOptions)
    Service->>Repository: findAll(queryOptions)
    Repository->>AbstractRepository: findAllWithQueryBuilder(serverOptions, clientOptions)
    Note over AbstractRepository: Processes serverOptions (FindOptions) and clientOptions (QueryOptionsDto)

    AbstractRepository->>QueryBuilder: buildDynamicQuery<T>(schema, serverOptions, clientOptions)

    QueryBuilder->>QueryBuilder: Extract clientOptions parameters
    Note over QueryBuilder: Extracts filter items, search text, pagination, and sort parameters

    QueryBuilder->>WhereBuilder: buildWhereClause(serverWhere, clientFilter, schema, searchText)

    WhereBuilder->>SearchBuilder: buildSearchQuery(schema, searchText)
    SearchBuilder->>SearchBuilder: getQueryableFields(schema)
    Note over SearchBuilder: Extracts searchable fields from Zod schema metadata
    SearchBuilder->>SearchBuilder: Handle nested fields with dot notation
    SearchBuilder-->>WhereBuilder: Return text search conditions with Op.or and Op.iLike

    WhereBuilder->>FilterBuilder: buildFilterQuery(schema, clientFilter)
    Note over FilterBuilder: Transforms filter items to Sequelize format with appropriate operators
    FilterBuilder->>FilterBuilder: Process filter operators (eq, neq, gt, lt, contains, etc.)
    FilterBuilder->>FilterBuilder: Handle nested properties with dot notation
    FilterBuilder-->>WhereBuilder: Return sequelize filter conditions

    WhereBuilder-->>QueryBuilder: Return combined where clause with Op.and

    QueryBuilder->>SortBuilder: buildSortClause(sortItems, serverOrder)
    SortBuilder->>SortBuilder: Process sort parameters
    Note over SortBuilder: Handles nested sort paths with dot notation
    SortBuilder-->>QueryBuilder: Return sort order array

    QueryBuilder->>QueryBuilder: Calculate offset from page and limit
    QueryBuilder-->>AbstractRepository: Return query object with where, include, limit, offset, order

    AbstractRepository->>Model: findAndCountAll(query)
    Note over Model: Executes SQL query with all parameters
    Model-->>AbstractRepository: Return { rows, count } result

    AbstractRepository->>PageMetaDto: new PageMetaDto({ queryOptionsDto: clientOptions, itemCount: count })
    PageMetaDto->>PageMetaDto: Calculate pagination metadata
    Note over PageMetaDto: Calculates page, pageSize, count, pageCount, hasPreviousPage, hasNextPage
    PageMetaDto-->>AbstractRepository: Return metadata object

    AbstractRepository-->>Repository: Return { data: rows, meta }
    Repository-->>Service: Return paginated result
    Service-->>Controller: Return formatted response
    Controller-->>Client: Return JSON response with data and metadata
```

## Key Components

1. **Controller Layer**: Handles HTTP requests and uses ZodValidationPipe for request validation
2. **Service Layer**: Contains business logic and calls repository methods
3. **Repository Layer**: Custom repository classes that extend AbstractRepository
4. **AbstractRepository**: Provides common data access methods including findAllWithQueryBuilder
5. **QueryBuilder**: Constructs Sequelize query options from client parameters
6. **WhereBuilder**: Builds WHERE clauses for filtering and searching
7. **SearchBuilder**: Handles text search across multiple fields
8. **FilterBuilder**: Processes filter conditions with various operators
9. **SortBuilder**: Handles sorting by multiple fields
10. **Model**: Sequelize model that performs the actual database query
11. **PageMetaDto**: Creates pagination metadata based on results

## Handling Nested Properties

The Smart API server package provides robust support for working with nested properties:

1. **Dot Notation**: Client can use dot notation (e.g., 'user.profile.role') in filters and sort parameters
2. **Circular References**: The system properly handles circular references between related entities
3. **Relationship Types**: Supports various relationship types (1:1, 1:Many, Many:Many)
4. **Case-Insensitive Search**: Implements case-insensitive search across nested properties

## Zod Schema Integration

The sequence diagram shows how Zod schemas are used throughout the process:

1. **Request Validation**: ZodValidationPipe validates incoming request parameters
2. **Field Discovery**: Queryable fields are extracted from schema metadata
3. **Type Safety**: The entire process maintains type safety from request to response
