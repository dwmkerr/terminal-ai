# A few examples of the get costs api:
aws ce get-cost-and-usage \
    --time-period="Start=2023-11-10,End=2023-11-11" \
    --granularity="DAILY" \
    --metrics="UnblendedCost" \
    --group-by Type=TAG,Key=boxes.boxid
aws ce get-cost-and-usage \
    --time-period="Start=2023-11-01,End=2023-11-11" \
    --granularity="MONTHLY" \
    --metrics="UnblendedCost" \
    --group-by Type=TAG,Key=boxes.boxid

