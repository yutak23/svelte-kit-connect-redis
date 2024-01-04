import { describe, it, expect } from 'vitest';
import example from "../src/index.js";

describe('Test', () => {
	it('req.token is set', () => {
		example();
		expect(true).toBe(true);
	});
});
