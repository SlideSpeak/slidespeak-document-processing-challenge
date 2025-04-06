import logging


logger = logging.getLogger(__name__)


async def call_func_with_retries(func, *args, max_attempts=3, **kwargs):
    """
    Retry a given function up to `max_attempts` times with a specified delay between attempts.

    Args:
        func: The function to be called.
        args: Positional arguments for the function.
        max_attempts (int): Maximum number of attempts. Defaults to 2.
        kwargs: Keyword arguments for the function.

    Returns:
        The result of the function call if successful.

    Raises:
        The last exception if all attempts fail.
    """

    attempts = 0
    while attempts <= max_attempts:
        try:
            return await func(*args, **kwargs)
        except:
            if attempts >= max_attempts:
                raise
            else:
                attempts += 1
