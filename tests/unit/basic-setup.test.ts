describe('Basic Test Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2)
  })

  test('Test environment has required globals', () => {
    expect(global.fetch).toBeDefined()
    expect(window.matchMedia).toBeDefined()
    expect(global.ResizeObserver).toBeDefined()
  })

  test('Module resolution works', () => {
    // This test verifies that our module mapping is working
    expect(() => {
      // Simple require to verify path resolution
      const path = require('path')
      expect(path).toBeDefined()
    }).not.toThrow()
  })
})
