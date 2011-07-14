function urlencode() {
    python -c "import sys, urllib as ul; print ul.quote_plus(sys.argv[1])" $1
}


if ! [ -f "$1" ]; then
    echo "usage: $0 emails_file email_template url_prefix subject" >& 2
    exit 1
fi
if [ -z "$2" ]; then
    echo "usage: $0 emails_file email_template url_prefix subject" >& 2
    exit 1
fi
if [ -z "$3" ]; then
    echo "usage: $0 emails_file email_template url_prefix subject" >& 2
    exit 1
fi
if [ -z "$4" ]; then
    echo "usage: $0 emails_file email_template url_prefix subject" >& 2
    exit 1
fi

EMAIL_FILE=$1
EMAIL_TEMPLATE=`urlencode $2`
BASE_URL=`urlencode $3`
SUBJECT=`urlencode $4`
ADMIN_URL=$3/administrator

echo EMAIL_FILE=$1
echo EMAIL_TEMPLATE=$EMAIL_TEMPLATE
echo BASE_URL=$BASE_URL
echo ADMIN_URL=$ADMIN_URL
echo SUBJECT=$SUBJECT


wget -O - "$ADMIN_URL/resetKey"

echo -n "enter new auth key from log file: "
read key

while read email; do
    echo "inviting $email"
    urlEmail=`urlencode $email`
    wget -O - "$ADMIN_URL/invite?key=$key&email=$urlEmail&template=$EMAIL_TEMPLATE&baseUrl=$BASE_URL&subject=$SUBJECT"
    echo
    echo
done <$EMAIL_FILE
