```js
// Импорт логики для каждой роли
// Импорт логики роли харвестера
/** @type {import('./role.harvester')} */
const roleHarvester = require('role.harvester');

// Импорт логики роли билдера
/** @type {import('./role.builder')} */
const roleBuilder = require('role.builder');

// Импорт логики роли апгрейдера
/** @type {import('./role.upgrader')} */
const roleUpgrader = require('role.upgrader');

// Очистка памяти от крипов, которых уже нет в игре
for (const name in Memory.creeps) {
  if (!Game.creeps[name]) {
    delete Memory.creeps[name];
    console.log('Clearing non-existing creep memory:', name);
  }
}

//Привер применения фильтра для подсчёта крипов по ролям
const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
console.log('Harvesters: ' + harvesters.length);

//Создание масива с крипами опредленной роли через фильтр
const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');

//Автоспавн крипов с определенной ролью до N количества
if (harvesters.length < 2) {
  const newName = 'Harvester' + Game.time;
  console.log('Spawning new harvester: ' + newName);
  Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'harvester' } });
}

//Индикация процесса создания нового крипа
if (Game.spawns['Spawn1'].spawning) {
  const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
  Game.spawns['Spawn1'].room.visual.text(
    '🛠️' + spawningCreep.memory.role,
    Game.spawns['Spawn1'].pos.x + 1,
    Game.spawns['Spawn1'].pos.y,
    { align: 'left', opacity: 0.8 },
  );
}

// Перебор всех крипов и запуск их поведения по роли
for (const name in Game.creeps) {
  const creep = Game.creeps[name];

  switch (creep.memory.role) {
    case 'harvester':
      // Запуск логики роли харвестера
      roleHarvester.run(creep);
      break;

    case 'builder':
      // Запуск логики роли билдера
      roleBuilder.run(creep);
      break;

    case 'upgrader':
      // Запуск логики роли апгрейдера
      roleUpgrader.run(creep);
      break;
  }
}

//Пример применения фильтра при поиске структур для собирателя
const targets = creep.room.find(FIND_STRUCTURES, {
  filter: (structure) => {
    return (
      (structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_SPAWN ||
        structure.structureType === STRUCTURE_TOWER) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
  },
});

//Цикл с логом, который показывает количество энергии в комнатах
for (const name in Game.rooms) {
  console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy');
}

//Базовый код для работы защитной башни с определенным ID
const tower = Game.getObjectById('174c131e5a4529b15faa1a7d');
if (tower) {
  const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (structure) => structure.hits < structure.hitsMax,
  });
  if (closestDamagedStructure) {
    tower.repair(closestDamagedStructure);
  }

  const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if (closestHostile) {
    tower.attack(closestHostile);
  }
}

//Базовый шаблон для модуля role.harvester
const roleHarvester = {
  /** @param {Creep} creep */
  run(creep) {
    // Если в памяти ещё нет состояния — задаём начальное
    if (!creep.memory.state) {
      creep.memory.state = 'harvesting';
    }

    // Читаем текущее состояние в локальную переменную
    let state = creep.memory.state;

    // --- Переключение состояний ---

    // Если отдаём энергию и инвентарь пустой → переходим к добыче
    if (state === 'delivering' && creep.store.getUsedCapacity() === 0) {
      state = 'harvesting';
    }

    // Если добываем и инвентарь заполнен → переходим к доставке
    if (state === 'harvesting' && creep.store.getFreeCapacity() === 0) {
      state = 'delivering';
    }

    // --- Поведение в каждом состоянии ---

    // 1. Состояние "добыча энергии"
    if (state === 'harvesting') {
      const sources = creep.room.find(FIND_SOURCES);

      // Если есть хотя бы один источник → идём добывать с него энергию
      if (sources.length > 0) {
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {
            visualizePathStyle: { stroke: '#ffaa00' },
          });
        }
      }
    }

    // 2. Состояние "доставка энергии"
    else if (state === 'delivering') {
      // Ищем структуры, которым нужна энергия: Spawn / Extension / Tower
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType === STRUCTURE_EXTENSION ||
              structure.structureType === STRUCTURE_SPAWN ||
              structure.structureType === STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });

      // Если есть хотя бы одна подходящая структура → несем ей энергию
      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: '#ffffff' },
          });
        }
      }
    }

    // Сохраняем обновлённое состояние в память крипа
    creep.memory.state = state;
  },
};

module.exports = roleHarvester;

//Базовый шаблон для модуля role.upgrader
const roleUpgrader = {
  /** @param {Creep} creep */
  run(creep) {
    // Если в памяти ещё нет состояния — задаём начальное
    if (!creep.memory.state) {
      creep.memory.state = 'harvesting';
    }

    // Читаем текущее состояние в локальную переменную
    let state = creep.memory.state;

    // --- Переключение состояний ---

    // Если улучшаем и инвентарь пустой → переходим к добыче
    if (state === 'upgrading' && creep.store.getUsedCapacity() === 0) {
      state = 'harvesting';
    }

    // Если добываем и инвентарь заполнен → переходим к улучшению
    if (state === 'harvesting' && creep.store.getFreeCapacity() === 0) {
      state = 'upgrading';
    }

    // --- Поведение в каждом состоянии ---

    // 1. Состояние "добыча энергии"
    if (state === 'harvesting') {
      const sources = creep.room.find(FIND_SOURCES);

      // Если есть хотя бы один источник → идём добывать с него энергию
      if (sources.length > 0) {
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {
            visualizePathStyle: { stroke: '#ffaa00' },
          });
        }
      }
    }

    // 2. Состояние "Улучшение контроллера"
    else if (state === 'upgrading') {
      // Если есть контроллер → несем ему энергию
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, {
            visualizePathStyle: { stroke: '#ffffff' },
          });
        }
      }
    }

    // Сохраняем обновлённое состояние в память крипа
    creep.memory.state = state;
  },
};

module.exports = roleUpgrader;

//Базовый шаблон для модуля role.builder
const roleBuilder = {
  /** @param {Creep} creep */
  run(creep) {
    // Если в памяти ещё нет состояния — задаём начальное
    if (!creep.memory.state) {
      creep.memory.state = 'harvesting';
    }

    // Читаем текущее состояние в локальную переменную
    let state = creep.memory.state;

    // --- Переключение состояний ---

    // Если строим и инвентарь пустой → переходим к добыче
    if ((state === 'building' || state === 'upgrading') && creep.store.getUsedCapacity() === 0) {
      state = 'harvesting';
    }

    // Если добываем и инвентарь заполнен → переходим к строительству
    if (state === 'harvesting' && creep.store.getFreeCapacity() === 0) {
      state = 'building';
    }

    // Если ничего строить → переходим к улучшению
    if (
      state === 'building' &&
      creep.store.getUsedCapacity() > 0 &&
      creep.room.find(FIND_CONSTRUCTION_SITES).length === 0
    ) {
      state = 'upgrading';
    }

    // --- Поведение в каждом состоянии ---

    // 1. Состояние "добыча энергии"
    if (state === 'harvesting') {
      const sources = creep.room.find(FIND_SOURCES);

      // Если есть хотя бы один источник → идём добывать с него энергию
      if (sources.length > 0) {
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {
            visualizePathStyle: { stroke: '#ffaa00' },
          });
        }
      }
    }

    // 2. Состояние "строительство"
    else if (state === 'building') {
      // Ищем структуры, которые можем строить
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);

      // Если есть хотя бы одна подходящая структура → несем ей энергию
      if (targets.length > 0) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: '#ffffff' },
          });
        }
      }
    }

    // 3. Состояние "Улучшение контроллера"
    else if (state === 'upgrading') {
      // Если есть контроллер → несем ему энергию
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, {
            visualizePathStyle: { stroke: '#ffffff' },
          });
        }
      }
    }

    // Сохраняем обновлённое состояние в память крипа
    creep.memory.state = state;
  },
};

module.exports = roleBuilder;

//Базовый шаблон для модуля spawnManager.js
// Отладочная информация
const DEBUG_SPAWN = true;

const spawnManager = {
  run: function () {
    // Получаем первый спавн в игре (можно улучшить, если будет несколько спавнов)
    const spawn = Object.values(Game.spawns)[0];
    if (!spawn) {
      return; // Нет спавна, выходим
    }

    // Подсчёт крипов каждой роли
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');

    // Определение желаемого количества крипов по ролям
    const desiredCounts = { harvester: 2, upgrader: 1, builder: 1 };

    // Проверка занят ли сейчас спавн
    if (!spawn.spawning) {
      // Спавн крипов с ролью Harvester
      if (harvesters.length < desiredCounts.harvester) {
        const newName = 'Harvester' + Game.time;
        const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: { role: 'harvester' },
        });
        if (DEBUG_SPAWN && result === OK) {
          console.log('Spawning new harvester: ' + newName);
        }
      }
      // Спавн крипов с ролью Upgrader
      else if (upgraders.length < desiredCounts.upgrader) {
        const newName = 'Upgrader' + Game.time;
        const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: { role: 'upgrader' },
        });
        if (DEBUG_SPAWN && result === OK) {
          console.log('Spawning new upgrader: ' + newName);
        }
      }

      // Спавн крипов с ролью Builder
      else if (builders.length < desiredCounts.builder) {
        // Подсчёт строительных площадок
        const siteCount = spawn.room.find(FIND_CONSTRUCTION_SITES).length;
        // Спавним билдера только если есть строительные площадки
        if (siteCount > 0) {
          const newName = 'Builder' + Game.time;
          const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
            memory: { role: 'builder' },
          });
          if (DEBUG_SPAWN && result === OK) {
            console.log('Spawning new builder: ' + newName);
          }
        }
      }
    }

    // Визуализация процесса спавна на экране
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text('🛠️' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
        align: 'left',
        opacity: 0.8,
      });
    }
  },
};

module.exports = spawnManager;
```
