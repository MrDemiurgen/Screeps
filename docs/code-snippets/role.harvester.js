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
