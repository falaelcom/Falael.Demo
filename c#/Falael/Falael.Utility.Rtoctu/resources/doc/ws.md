file system monitoring engine

- file footprint (ff)
    - path - immutable key
    - known modified time - last known from file system
    - known size - last known from file system

- discovery mechanisms (3 concurrent sources)
    - initial scanner - full tree scan on startup
    - periodic scanner - full tree scan on timer
    - filesystem watcher - real-time events (create/modify/delete)
    - all post full file info to debounce buffer (modtime, size)
    - on delete event: check file existence after timestamp captured
        - if file exists, generate create/update to avoid inversions

- mod debounce buffer (fully thread-synchronized)
    - post(filepath, eventtype, modtime, size) - adds to per-file queue
    - next() - returns collapsed mod for one file or null
    - maintains per-file event queues internally
    - grace period based on last mod time (or discovery time for delete)
    - won't return files still in grace period
    - internal timer polls all queues for expired grace periods
    - signals orchestrator when any grace period expired
    - thread-safe for all operations

- lock handling
    - check lock status only when ff ready to process
    - if locked, post update event with check time
    - renews grace period, delays processing

- orchestrator
    - receives signal from debounce buffer
    - runs processing loop while next() returns data
    - stops when next() returns null

- processing loop
    - pulls one file from debounce buffer via next()
    - next() internally sorts events by known mod time
    - next() collapses events (create+delete+create=create)
    - applies final change to master file list
    - invokes signal callback after each change

- master file list
    - concurrent dictionary of all known ffs
    - thread-safe add/update/remove operations
    - keyed by file path

- external interface
    - signal() callback - invoked on each atomic change to master list
    - initialscancompletesignal() - invoked once after initial scan
    - snapshot() - returns current master list copy
    - user tracks deltas between snapshots
    - allows user to persist/restore state between sessions

- event flow
    discovery → debounce buffer → orchestrator → processor → master list → signal
