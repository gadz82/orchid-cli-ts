// CancelScope — handles SIGINT and ESC key during interactive sessions

export class CancelScope {
  private cancelled = false;
  private handlers: Array<() => void> = [];

  constructor() {
    this.onSigint = this.onSigint.bind(this);
    process.on('SIGINT', this.onSigint);
  }

  get isCancelled(): boolean {
    return this.cancelled;
  }

  onCancel(handler: () => void): void {
    this.handlers.push(handler);
  }

  throwIfCancelled(): void {
    if (this.cancelled) {
      throw new CancelError('Operation cancelled by user');
    }
  }

  reset(): void {
    this.cancelled = false;
    this.handlers = [];
  }

  dispose(): void {
    process.removeListener('SIGINT', this.onSigint);
  }

  private onSigint(): void {
    if (!this.cancelled) {
      this.cancelled = true;
      console.log(`\nCancelling... (press Ctrl+C again to force quit)`);
      for (const handler of this.handlers) {
        handler();
      }
    } else {
      // Second SIGINT — force quit
      console.log('Force quitting');
      process.exit(1);
    }
  }
}

export class CancelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CancelError';
  }
}
