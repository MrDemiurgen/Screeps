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
