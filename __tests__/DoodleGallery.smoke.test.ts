describe('DoodleGallery smoke', () => {
  it('component file imports without error', async () => {
    // require the component to ensure it compiles
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@/components/DoodleGallery');
    expect(mod).toBeDefined();
  });
});
