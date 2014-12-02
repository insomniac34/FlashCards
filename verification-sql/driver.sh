#the main driver for executing FlashCards Verification SQL

echo 'creating test data...' && 
python create_data.py && 
echo 'executing orm functions under test...' && 
node orm-handler.js && 
echo 'verifying results...' &&
python verification.py  &&
echo 'deleting dummy data...' &&
python delete_data.py