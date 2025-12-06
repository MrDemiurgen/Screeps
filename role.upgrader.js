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
