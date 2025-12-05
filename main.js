/** @type {import('./role.harvester')} */
const roleHarvester = require('role.harvester');

/** @type {import('./role.builder')} */
const roleBuilder = require('role.builder');

/** @type {import('./role.upgrader')} */
const roleUpgrader = require('role.upgrader');

module.exports.loop = function () {
  console.log('Tick:', Game.time);
};
