const omitObjectKeys = (originalObject = {}, keysToOmit = []) => {    
    const clonedObject = { ...originalObject };      
    
    for (const path of keysToOmit) {
        delete clonedObject[path];
    }     
  
    return clonedObject;
}

const TAG_NAME = 'foreignFieldDirection';
const FORWARD_TAG_VALUE = 'forward';
const BACKWARD_TAG_VALUE = 'backward';

// The tag value will one of the following states
// -- `undefined` when tag isn't used
// -- `true` when tag was used without an argument
// -- a string when an argument was usd.
const foreignFieldDirectionTag = (introspection) => {
    const tagValue = introspection.tags[TAG_NAME]
    if (tagValue !== undefined
            && tagValue !== FORWARD_TAG_VALUE
            && tagValue !== BACKWARD_TAG_VALUE) {
        throw new Error(
            `${TAG_NAME} smart tag must have a single argument ` +
                'that is either `forward` or `backward`'
        );
    }
    return tagValue
}

const ForeignFieldDirectionPlugin = (builder) => {
    // In the format {[classId: string]: fieldName}
    let fieldsToOmit = {}
    builder.hook('build', (input) => {
        fieldsToOmit = {}
        return input;
    });
    builder.hook("GraphQLObjectType:fields", (fields, _, { Self, scope }) => {
        const mayIncludeFieldToOmit = scope.isPgRowType
            || scope.isPgCreatePayloadType
            || scope.isPgUpdatePayloadType
            || scope.isPgDeletePayloadType;
        if (mayIncludeFieldToOmit && fieldsToOmit[scope.pgIntrospection.id]) {
            return omitObjectKeys(fields, [fieldsToOmit[scope.pgIntrospection.id]])
        }
        return fields;
    });
    builder.hook("GraphQLObjectType:fields:field", (input, { pgOmit }, { scope }) => {
        // We only need to run the hook logic once to flag the class. Let's skip mutation payloads
        if (scope.isMutationPayload) {
            return input;
        }

        if (scope.isPgBackwardRelationField) {
            const sourceClassIdOfForiegnKey = scope.pgFieldIntrospection.id
            const foreignConstraintIntrospection = scope.pgIntrospection
                .foreignConstraints
                .find(({ classId }) => classId === sourceClassIdOfForiegnKey)
            if (foreignFieldDirectionTag(foreignConstraintIntrospection) === FORWARD_TAG_VALUE) {
                fieldsToOmit[foreignConstraintIntrospection.foreignClassId] = scope.fieldName;
            }
        }

        if (scope.isPgForwardRelationField) {
            const foreignConstraintIntrospection = scope.pgFieldIntrospection
            if (foreignFieldDirectionTag(foreignConstraintIntrospection) === BACKWARD_TAG_VALUE) {
                fieldsToOmit[scope.pgIntrospection.id] = scope.fieldName;
            }
        }
        return input;
    });
};

module.exports.ForeignFieldDirectionPlugin = ForeignFieldDirectionPlugin;
