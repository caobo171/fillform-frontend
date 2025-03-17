export class NumberUtil{

	public static display(value:number){
		return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
}	