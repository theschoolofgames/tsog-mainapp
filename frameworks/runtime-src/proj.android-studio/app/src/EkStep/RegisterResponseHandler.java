package EkStep;

/**
 * Created by Tony on 1/17/17.
 */

import org.ekstep.genieservices.sdks.response.GenieResponse;
import org.ekstep.genieservices.sdks.response.IResponseHandler;

public class RegisterResponseHandler implements IResponseHandler {
    private IRegister mRegister = null;

    public RegisterResponseHandler(IRegister register) {
        mRegister = register;
    }

    @Override
    public void onSuccess(GenieResponse response) {
        // Code to handle success scenario
        mRegister.onRegisterSuccess(response);

    }

    @Override
    public void onFailure(GenieResponse response) {
        // Code to handle error scenario
        mRegister.onRegisterFailure(response);
    }

}
