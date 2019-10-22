const prov = {
    "prefix": {
        "ex": "http://example.org",
        "w3": "http://www.w3.org/"
    },
    "entity": {
        "ex:input": {
            "rdfs:label": "bedfile"
        },
        "ex:output": {
            "rdfs:label": "beddbfile"
        }
    },
    "activity": {
        "ex:run": {
            "rdfs:label": "bedtobeddb"
        }
    },
    "wasGeneratedBy": {
        "_:1": {
            "prov:activity": "ex:run",
            "prov:entity": "ex:output"
        }
    },
    "used": {
        "_:2": {
            "prov:activity": "ex:run",
            "prov:entity": "ex:input"
        }
    }
}

function getNamesMap(prov, propName) {
  return Object.fromEntries(
    Object.entries(prov[propName])
      .map(
        ([id, props]) => [id, props['rdfs:label']]
      )
  );
}

function getActivityEntityMap(prov, propName) {
  return Object.fromEntries(
    Object.values(prov[propName])
      .map(
        (props) => [props['prov:activity'], props['prov:entity']]
      )
  );
}

function getActivityInOut(prov, activityId) {
  const generatedByMap = getActivityEntityMap(prov, 'wasGeneratedBy');
  const usedMap = getActivityEntityMap(prov, 'used');
  return [usedMap[activityId], generatedByMap[activityId]]
}

function provToCwl(prov) {
  // TODO: This just handles one example.
  // Get confirmation that this will be the input structure before investing more time.

  const activityId = 'ex:run'
  const [entityInputId, entityOutputId] = getActivityInOut(prov, activityId);

  const activityName = prov.activity[activityId]['rdfs:label'];
  const inputName = prov.entity[entityInputId]['rdfs:label'];
  const outputName = prov.entity[entityOutputId]['rdfs:label'];

  return [
      {
          "name": activityName,
          "inputs":[
              {
                  "meta":{ "global": true },
                  "name": inputName,
                  "source":[]
              }
          ],
          "outputs":[
              {
                  "meta":{ "global":true },
                  "name": outputName,
                  "target":[
                      {
                          "name": outputName
                      }
                  ]
              }
          ]
      }
  ];
}

export const STEPS = provToCwl(prov);
