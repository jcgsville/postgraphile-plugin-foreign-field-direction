# postgraphile-plugin-foreign-field-direction

This plugin allows you to expose only a single direction of connections exposed by foreign key
constraints.

## Example

With the following schema

```sql
create table classroom (
    id int primary key
);
create table teacher (
    id int primary key,
    classroom_id int not null references classroom(id)
);
```

in the GraphQL generated, the `Teacher` type will have a `classroomByClassroomId` field, and the
`Classroom` type will have a `teachersByClassroomId` field.

By using the `foreignFieldDirection` smart tag, you can choose to expose only one of those two
fields.

For example, via a smart comment

```sql
comment on constraint teacher_classroom_id_fkey on teacher is E'@foreignFieldDirection forward';
```

## Primary Key as Foreign Key Example

With the following schema

```sql
create table classroom (
    id int primary key
);
create table classroom_other_info (
    id int primary key references classroom(id)
);
```

in the GraphQL generated, the `Classroom` type will have a `classroomOtherInfoById` field and a
`classroomOtherInfosById` field. Setting the foreign field direction to forward only will omit both
these fields on `Classroom`.

## Usage

This is a simple plugin. You can just copy it into your project and modify as needed. You can
install it using npm or yarn:

```sh
yarn add postgraphile-plugin-foreign-field-direction
```

```js
const { ForeignFieldDirectionPlugin } = require('postgraphile-plugin-foreign-field-direction')
```

## Smart Tag Arguments

`forward` and `backward` are the only valid arguments for the `foreignFieldDirection` smart tag.
Any other value, including a blank value, will set throw an error and prevent the GQL schema from
compiling.

The `forward` argument indicates that you want to expose a traversal only FROM the table on which
the constraint is defined.

The `backward` argument indicates that you want to expose a traversal only TO the table on which
the constraint is defined.

## Compatibility

This plugin has no dependencies. It was tested with Postgraphile v4.12.9.
