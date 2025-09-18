import WinBox from '../winbox';

describe('WinBox', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Set up a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up on exiting
    document.body.removeChild(container);
    container.remove();
  });

  it('should create a new WinBox instance', () => {
    const winbox = new WinBox({
      title: 'Test Window',
      mount: container,
    });

    expect(winbox).toBeInstanceOf(WinBox);
    expect(document.querySelector('.wb-title')?.textContent).toBe('Test Window');
    winbox.close();
  });

  it('should close the window', () => {
    const winbox = new WinBox({
      title: 'Test Window',
      mount: container,
    });

    const closeButton = document.querySelector('.wb-close');
    expect(closeButton).not.toBeNull();

    // Simulate click on close button
    closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // The window should be removed from DOM
    expect(document.querySelector('.wb-body')).toBeNull();
  });

  it('should update title when setTitle is called', () => {
    const winbox = new WinBox({
      title: 'Initial Title',
      mount: container,
    });

    winbox.setTitle('Updated Title');
    expect(document.querySelector('.wb-title')?.textContent).toBe('Updated Title');
    winbox.close();
  });

  it('should handle mount content', () => {
    const content = document.createElement('div');
    content.textContent = 'Test Content';

    const winbox = new WinBox({
      mount: content,
    });

    expect(document.body.contains(content)).toBe(true);
    expect(winbox.body?.contains(content)).toBe(true);
    winbox.close();
  });
});
