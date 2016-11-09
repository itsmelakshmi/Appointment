// Code goes here
angular.module('scheduleApp', ['ui.bootstrap'])
.controller('scheduleController', function($scope, $uibModal, $log, $document) {
  var vm = this;
  
  vm.minTime = 540;
  vm.maxTime = 1020;
  vm.interval = 60;
  vm.animationsEnabled = true;
  vm.displayTimeString24 = false;
  vm.selectedAppointment = {};
  
  vm.appointments = {
    monday: {name: 'Monday', slots: getTimeSlots(vm.minTime,vm.maxTime,vm.interval)},
    tuesday: {name: 'Tuesday', slots: getTimeSlots(vm.minTime,vm.maxTime,vm.interval)},
    wednesday: {name: 'Wednesday', slots: getTimeSlots(vm.minTime,vm.maxTime,vm.interval)},
    thursday: {name: 'Thursday', slots: getTimeSlots(vm.minTime,vm.maxTime,vm.interval)},
    friday: {name: 'Friday', slots: getTimeSlots(vm.minTime,vm.maxTime,vm.interval)},
    saturday: {name: 'Saturday', slots: getTimeSlots(vm.minTime,vm.maxTime,vm.interval)}
  };
  
  vm.reset = function () {
    angular.forEach(vm.appointments, function(appointment) {
      angular.forEach(appointment.slots, function(slot) {
        slot.booked = false;
      });
    });
  };
  
  vm.onTimeSlotClick = function (appointment, slot, size, parentSelector) {
    var parentElem = parentSelector ? angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: vm.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'timeSlotSummaryPopup.html',
      controller: 'timeSlotPopUpController',
      controllerAs: 'timeSlotPopUpCtrl',
      size: size,
      appendTo: parentElem,
      resolve: {
        appointments: function () {
          return vm.appointments;
        },
        appointment: appointment,
        slot: slot
      }
    });

    modalInstance.result.then(function (selected) {
      angular.forEach(vm.appointments, function(appointment) {
        if (appointment.name === selected.appointment.name) {
          angular.forEach(appointment.slots, function(slot) {
            if (slot.time === selected.slot.time) {
              slot.contact.name = selected.slot.contact.name;
              slot.contact.number = selected.slot.contact.number;
              slot.booked = true;
            }
          });
        }
      });
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });
  };
  
  function getTimeSlots(minTime, maxTime, interval) {
    var timeSlots = {};
    for (var i = 0;(minTime + (i*interval)) <= maxTime;i++) {
      //console.log(minTime + (i*interval));
      
      timeSlots[minTime + (i*interval)] = {time: "", booked: false, contact: {name: "", number: ""}};
      
      timeSlots[minTime + (i*interval)].time = getTimeString(minTime + (i*interval));
    }
    
    return timeSlots;
  }
  
  function leftPadString(str, padStr, length) {
  	if (padStr === null || padStr === undefined) padStr = "0";
  	if (length === null || length === undefined) length = 2;
  	str += '';
  	while (str.length < length)
  		str = padStr + str;
  	return str;
  }
  
  function getTimeString24(minutes) {
  	if (minutes === undefined) minutes = 0;
  	minutes = parseInt(minutes, 10);
  	var hrs = Math.floor(minutes / 60);
  	var mins = minutes % 60;
  	var timeString = leftPadString(hrs, '0', 2) + ':' + leftPadString(mins, '0', 2);
  	return timeString;
  }
  
  function getTimeString(iminutes, addSpace, meridiemLength) {
    var displayTimeString24 = vm.displayTimeString24;
  	if (displayTimeString24) return getTimeString24((iminutes >= 1440) ? (iminutes % 1440) : iminutes);
  	var minutes = parseInt(iminutes, 10);
  	var cDate = new Date(1970, 0, 1, 0, 0, 0, 0);
  	cDate.setMinutes(minutes);
  	var hrs = cDate.getHours();
  	var hrString = leftPadString(((hrs % 12 === 0) ? '12' : (hrs % 12)), '0', 2);
  	var mins = cDate.getMinutes();
  	var minString = leftPadString(mins, '0', 2);
  	var timeString = '';
  	if (meridiemLength && meridiemLength == 1) timeString = hrString + ':' + minString + ((addSpace) ? ' ' : '') + ((hrs >= 12) ? "p" : "a");
  	else timeString = hrString + ':' + minString + ((addSpace) ? ' ' : '') + ((hrs >= 12) ? "pm" : "am");
  	return timeString;
  }
});


angular.module('scheduleApp')
.controller('timeSlotPopUpController', function($scope, $uibModalInstance, appointments, appointment, slot) {
  //console.log(appointments);
  //console.log(appointment);
  //console.log(slot);
  
  var vm = this;
  vm.appointments = appointments;
  vm.selected = {
    appointment: appointment,
    slot: slot
  };
  
  vm.ok = function () {
    $uibModalInstance.close(vm.selected);
  };

  vm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});