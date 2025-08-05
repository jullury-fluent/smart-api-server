# FindAll Sequence Diagram

The following diagram illustrates the flow of the `findAllWithQueryBuilder` method in the AbstractRepository class.

```mermaid
sequenceDiagram
    participant Client
    participant Repository
    participant AbstractRepository
    participant buildDynamicQuery
    participant buildWhereClause
    participant buildSearchQuery
    participant buildAdditionalFilters
    participant buildFilterQuery
    participant buildSortClause
    participant Model
    participant PageMetaDto

    Client->>Repository: findAllCompany(options)
    Repository->>AbstractRepository: findAllWithQueryBuilder(serverOptions, clientOptions)
    Note over AbstractRepository: Receives serverOptions (FindOptions) and clientOptions (QueryOptionsDto)

    AbstractRepository->>buildDynamicQuery: buildDynamicQuery<T>(schema, serverOptions, clientOptions)
    Note over buildDynamicQuery: From @smart-api/common

    buildDynamicQuery->>buildDynamicQuery: Extract clientOptions parameters
    Note over buildDynamicQuery: Extracts filter, query, limit, order_by, etc.

    buildDynamicQuery->>buildWhereClause: buildWhereClause(serverWhere, clientFilter, schema, searchText, additionalFields)

    buildWhereClause->>buildSearchQuery: buildSearchQuery(schema, searchText)
    buildSearchQuery->>buildSearchQuery: searchableFields(schema)
    Note over buildSearchQuery: Gets queryable fields from Zod schema
    buildSearchQuery->>buildSearchQuery: Handle nested fields with $field$ syntax
    buildSearchQuery-->>buildWhereClause: Return text search conditions

    buildWhereClause->>buildFilterQuery: buildFilterQuery(schema, clientFilter)
    Note over buildFilterQuery: Transforms client filters to Sequelize format
    buildFilterQuery-->>buildWhereClause: Return sequelize filter query

    buildWhereClause->>buildAdditionalFilters: buildAdditionalFilters(schema, additionalFields)
    Note over buildAdditionalFilters: Handles special case for string values with Op.iLike
    buildAdditionalFilters->>buildAdditionalFilters: Transform nested paths with $field$ syntax
    buildAdditionalFilters-->>buildWhereClause: Return additional filters

    buildWhereClause-->>buildDynamicQuery: Return combined where clause with Op.and

    buildDynamicQuery->>buildSortClause: buildSortClause(order_by, order_type, serverOrder)
    buildSortClause->>buildSortClause: Process sort parameters
    Note over buildSortClause: Handles nested sort paths with dot notation
    buildSortClause-->>buildDynamicQuery: Return combinedSort order

    buildDynamicQuery->>buildDynamicQuery: Calculate offset from page and limit
    buildDynamicQuery-->>AbstractRepository: Return query object with where, include, limit, offset, order

    AbstractRepository->>Model: findAndCountAll(query)
    Note over Model: Executes SQL query with all parameters
    Model-->>AbstractRepository: Return { rows, count } result

    AbstractRepository->>PageMetaDto: new PageMetaDto({ queryOptiosDto: clientOptions, itemCount: result.count })
    PageMetaDto->>PageMetaDto: Calculate pagination metadata
    Note over PageMetaDto: Calculates page, pageSize, count, pageCount, etc.
    PageMetaDto-->>AbstractRepository: Return metadata object

    AbstractRepository-->>Repository: Return { result, meta }
    Repository-->>Client: Return response data
```

## Key Components

1. **Repository Layer**: Custom repository classes that extend AbstractRepository
2. **AbstractRepository**: Provides common data access methods including findAllWithQueryBuilder
3. **buildDynamicQuery**: Utility from @smart-api/common that constructs Sequelize query options
4. **Model**: Sequelize model that performs the actual database query
5. **PageMetaDto**: Creates pagination metadata based on results

## Handling Nested Properties

The diagram shows how dot notation in client filters (like 'user.profile.role') is properly handled throughout the query building process, as noted in the buildFilterQuery and buildAdditionalFilters steps.
