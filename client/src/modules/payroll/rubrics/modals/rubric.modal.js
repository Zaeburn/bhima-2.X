angular.module('bhima.controllers')
  .controller('RubricModalController', RubricModalController);

RubricModalController.$inject = [
  '$state', 'RubricService', 'ModalService', 'NotifyService', 'appcache',
];

function RubricModalController($state, Rubrics, ModalService, Notify, AppCache) {
  var vm = this;
  vm.rubric = {};

  var cache = AppCache('RubricModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  vm.selectDebtorAccount = function selectDebtorAccount(account) {
    vm.rubric.debtor_account_id = account.id;
  };

  vm.selectExpenseAccount = function selectExpenseAccount(account) {
    vm.rubric.expense_account_id = account.id;
  };

  vm.setMaxPercent = function setMaxPercent() {
    vm.maxPercent = vm.rubric.is_percent ? true : false; 
  }

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Rubrics.read(vm.stateParams.id)
      .then(function (rubric) {
        vm.rubric = rubric;

        vm.setting = true;
      })
      .catch(Notify.handleError);
  }

  // submit the data to the server from all two forms (update, create)
  function submit(rubricForm) {
    var promise;

    if(!vm.rubric.is_discount){
      vm.rubric.is_discount = 0;
      vm.rubric.is_tax = 0;
      vm.rubric.is_ipr = 0;
    }

    if(vm.rubric.is_discount){
      vm.rubric.is_discount = 1;
      vm.rubric.is_social_care = 0;
    }

    if (rubricForm.$invalid || rubricForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Rubrics.create(vm.rubric) :
      Rubrics.update(vm.rubric.id, vm.rubric);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('rubrics', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('rubrics');
  }
}