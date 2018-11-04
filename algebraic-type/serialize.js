//const { Map, EmptyMap = Map() } = require("immutable");
const { getSerialize } = require("./declaration");
const { getPrototypeOf } = Object;



module.exports = function serialize(type, value)
{
    const state = { references:new Map(), nextUID:0, tail: { } };
    const serialized = [];
    const serialize = (type, value) =>
        ((serialize, unique) => unique ?
            serialize(value) :
            getReference(state, type, value).UID)
        (...getSerialize(type));

    var head = getReference(state, type, value);

    while (head)
    {
        const { UID, type, value } = head;

        serialized[UID] = getSerialize(type)[0](value, serialize);

        head = head.next;
    }
    
    return serialized;
}

function getReference(state, type, value)
{
    var forType = state.references.get(type);

    if (!forType)
        state.references.set(type, forType = new Map());

    const reference = forType.get(value);

    if (reference !== void 0)
        return reference;

    const UID = state.nextUID++;
    const newReference = { UID, type, value };

    forType.set(value, newReference);

    state.tail.next = newReference;
    state.tail = newReference;

    return newReference;
}
/*    
     ||
        (forType => (U, forType))(new Map());
    const UID = forType
        existing
        UIDs.set()
    
    const UID = forType.get(value, -1);

    return UID !== -1 ?
        [UID, UIDs, nextUID] :
        [nextUID, UIDs.set(type, forType.set(value, nextUID)), nextUID + 1];
}


    const tail = { UID, 
    const head = context.tail;

function getUID(UIDs, nextUID, type, value)
{
    const forType = UIDs.get(type, EmptyMap);
    const UID = forType.get(value, -1);

    return UID !== -1 ?
        [UID, UIDs, nextUID] :
        [nextUID, UIDs.set(type, forType.set(value, nextUID)), nextUID + 1];
}

    
    var protocol = (options && options.protocol) || Features.DEFAULT_PROTOCOL;
    var features = (options && options.features) || Features(protocol);

    var context = {
        UIDs: new Map(),
        UIDList: [],
        objects:[],
        types: Object.create(null),
        features: features
    };

    var UID = toObjectSerialization(anObject, context);
    var list = context.tail;

    while (list)
    {
    
        completeObjectSerialization(list.object, list.UID, context);

        list = list.next;
    }

    if (!(context.features & Features.IndexCompression))
        return { index: UID, objects: context.objects };

    // Sort the types.
    var typeMap = analyzeTypes(context);

    var serializedObjects = [];
    // Sort the serialized objects.
    analyzeUIDs(context.UIDList, function(aUID)
    {
        var serializedLocation = aUID.serializedLocation;
        var serializedObject = context.objects[serializedLocation];
        serializedObjects[aUID.__UNIQUE_ID] = serializedObject;
    });

    return { index: UID, objects: serializedObjects, typeMap: typeMap };
};

function _(UIDs, nextUID, type, value)
{
    const forType = UIDs.get(type, EmptyMap);

    if (forType !== -1)
    {
        const UID = forType.get(value, -1);

        return UID !== -1 ?
            [UID, UIDs, nextUID] :
            [nextUID, UIDs.set(type, forType.set(value, nextUID)), nextUID + 1];
    }

    return [nextUID, UIDs.set(type, Map.of(type, Map.of(value, nextUID))), nextUID + 1];
}



function toObjectSerialization(anObject, aContext, isKey)
{
    if (anObject === null)
        return -1;

    if (anObject === undefined)
        return -2;

    var type = typeof anObject;

    if (type === "number")
    {
        // NaN
        if (anObject !== anObject)
            return -3;

        // -0
        if (anObject === 0 && 1 / anObject === -Infinity)
            return -4;

        // -Infinity
        if (anObject === -Infinity)
            return -5;

        // Infinity
        if (anObject === Infinity)
            return -6;
    }

    var skipIndexCompression = !(aContext.features & Features.IndexCompression);

    var UIDs = aContext.UIDs;
    var UID = Call(MapGet, UIDs, anObject);

    if (UID !== undefined)
    {
        if (!skipIndexCompression)
            UID.references++;

        return UID;
    }

    UID = newUID(anObject, aContext, isKey);
    var location = skipIndexCompression ? UID : UID.serializedLocation;


    if (type === "string" ||
        type === "number" ||
        type === "boolean")
        aContext.objects[location] = anObject;
    else
    {
        aContext.objects[location] = null;

        var tail = { UID: UID, object: anObject };

        if (aContext.tail)
            aContext.tail.next = tail;

        aContext.tail = tail;
    }

    return UID;
}

var IS_MAP_SENTINEL = "@@__IMMUTABLE_MAP__@@";
var IS_SET_SENTINEL = "@@__IMMUTABLE_SET__@@";
var IS_LIST_SENTINEL = "@@__IMMUTABLE_LIST__@@";
var IS_ORDERED_SENTINEL = "@@__IMMUTABLE_ORDERED__@@";

function getInternalType(anObject, aContext)
{
    if (isArray(anObject))
    {
        var useLegacyArrays = aContext.features & Features.LegacyArraySerialation;
        return useLegacyArrays ? Types.LegacyArray : Types.Array;
    }

    if (Set && anObject instanceof Set)
    {
        var keys = ObjectKeys(anObject);
        return keys.length ? Types.GenericSet : Types.NoKeyValueSet;
    }

    if (Map && anObject instanceof Map)
    {
        var keys = ObjectKeys(anObject);
        return keys.length ? Types.GenericMap : Types.NoKeyValueMap;
    }

    // if (I.Map.isMap(anObject))
    if (anObject[IS_MAP_SENTINEL])
        return anObject[IS_ORDERED_SENTINEL] ? Types.ImmutableOrderedMap : Types.ImmutableMap;

    // if (I.List.isList(anObject))
    if (anObject[IS_LIST_SENTINEL])
        return Types.ImmutableList;

    // if (I.Set.isSet(anObject))
    if (anObject[IS_SET_SENTINEL])
        return anObject[IS_ORDERED_SENTINEL] ? Types.ImmutableOrderedSet : Types.ImmutableSet;

    return Types.GenericObject;
}

function encodableType(anInternalType, aContext)
{
    var existingType = aContext.types[anInternalType];

    if (existingType)
        return existingType;

    return aContext.types[anInternalType] = new TypeUID(anInternalType);
}

var serializers = [
    require("./serializers/generic-object"),
    require("./serializers/legacy-array"),
    require("./serializers/generic-array"),
    require("./serializers/pure-set"),
    require("./serializers/generic-set"),
    require("./serializers/pure-map"),
    require("./serializers/generic-map"),
    require("./serializers/pure-map"), // Immutable map can use pure-map.
    require("./serializers/pure-set"), // Immutable set can use pure-set.
    require("./serializers/immutable-list"),
    require("./serializers/pure-map"), // Immutable ordered map can use pure-map.
    require("./serializers/pure-set"), // Immutable ordered set can use pure-set.
];

function completeObjectSerialization(anObject, aUID, aContext)
{
    var internalType = getInternalType(anObject, aContext);
    var serializedType = encodableType(internalType, aContext);

    serializedType.increment();

    var serializedObject = [serializedType];
    var serializer = serializers[internalType];
    var location = (aContext.features & Features.IndexCompression) ? aUID.serializedLocation : aUID;

    aContext.objects[location] = serializer(serializedObject, anObject, aContext, toObjectSerialization);
}

function newUID(anObject, aContext, isKey)
{
    var location = aContext.objects.length;

    if (!(aContext.features & Features.IndexCompression))
    {
        Call(MapSet, aContext.UIDs, anObject, location);
        return location;
    }

    var UID = {
        serializedLocation: location,
        references: 1,
        potentialKeyID: isKey && anObject,
        __UNIQUE_ID: location,
        toJSON: function()
        {
            return this.__UNIQUE_ID;
        }
    };

    aContext.UIDList[aContext.UIDList.length] = UID;
    Call(MapSet, aContext.UIDs, anObject, UID);

    return UID;
}

function analyzeUIDs(UIDs, aFunction)
{
    Call(ArraySort, UIDs, function(a, b)
    {
        return b.references - a.references;
    });

    var offset = 0,
        i = 0,
        count = UIDs.length;

    for (; i < count; i++)
    {
        var aUID = UIDs[i];
        var potentialID = i - offset;
        var potentialKeyID = aUID.potentialKeyID;

        var canStoreAsString = typeof potentialKeyID === "string";
        var isShorterAsString = canStoreAsString && MathLog(potentialID) / MathLN10 >= potentialKeyID.length + 2;

        if (isShorterAsString)
        {
            aUID.__UNIQUE_ID = potentialKeyID;
            offset++;
        }
        else
            aUID.__UNIQUE_ID = potentialID;

        aFunction(aUID);
    }

    return UIDs;
}

function TypeUID(aType)
{
    this.internalType = aType;
    this.count = 0;
    this.__UNIQUE_ID = aType;
}

TypeUID.prototype.increment = function()
{
    this.count += 1;
};

TypeUID.prototype.toJSON = function()
{
    return this.__UNIQUE_ID;
};

function analyzeTypes(aContext)
{
    var keys = ObjectKeys(aContext.types);

    var allTypes = Call(ArrayMap, keys, function(aKey)
    {
        return aContext.types[aKey];
    });

    Call(ArraySort, allTypes, function(a, b)
    {
        return b.count - a.count;
    });

    var finalMapping = {};

    for (var i = 0; i < allTypes.length; i++)
    {
        var aType = allTypes[i];
        aType.__UNIQUE_ID = i;
        finalMapping[i] = aType.internalType;
    }

    return finalMapping;
}*/
