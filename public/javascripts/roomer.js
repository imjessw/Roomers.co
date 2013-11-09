$(document).ready(function(){
	
	$("#signUpForm").on("click", function(){
		var forms= $("#formInfo")
		var name= $("#name")
		forms.show();
		name.focus();
	})
	$("#subFormButton").on("click", function(){
		var forms= $("#formInfo")
		forms.hide();
	})
})