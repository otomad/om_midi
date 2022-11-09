declare module "this" {
	const thisObj: Panel | typeof globalThis;
	export default thisObj;
}
