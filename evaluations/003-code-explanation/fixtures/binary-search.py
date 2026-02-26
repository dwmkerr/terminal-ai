def binary_search(arr: list[int], target: int) -> int:
    """Find target in sorted array. Returns index or -1 if not found."""
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
